"use server";

import { headers } from "next/headers";

import {
  formatMessage,
  parseContactMessage,
  type ContactState,
} from "@/lib/contact-message";

/**
 * Delivery for the contact form.
 *
 * Resend is called over its REST API rather than through its SDK: this is one
 * POST with four fields, and the SDK would be a dependency to build a JSON body
 * that is shorter written out.
 *
 * Nothing here ever reports success it did not achieve. If the mail service is
 * not configured, or refuses the message, the visitor is told plainly and
 * pointed elsewhere — a form that silently swallows what someone wrote is worse
 * than no form, because they walk away believing they made contact.
 */

/**
 * One window per address, held in module memory.
 *
 * Honest about what this is: on a serverless platform each instance keeps its
 * own map and a cold start forgets everything, so it throttles a naive flood
 * rather than a determined one. It costs nothing and needs no store; if real
 * abuse ever arrives, this is the seam where a shared limiter or a challenge
 * would go.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const recent = new Map<string, number[]>();

function throttled(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(key, hits);
    return true;
  }

  hits.push(now);
  recent.set(key, hits);

  // The map would otherwise grow for the life of the instance.
  if (recent.size > 5000) {
    for (const [k, times] of recent) {
      if (times.every((at) => now - at >= WINDOW_MS)) recent.delete(k);
    }
  }

  return false;
}

async function clientKey(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

export async function sendContactMessage(
  _previous: ContactState,
  form: FormData,
): Promise<ContactState> {
  const values = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    topic: String(form.get("topic") ?? ""),
    message: String(form.get("message") ?? ""),
  };

  const parsed = parseContactMessage(form);

  if (!parsed.ok) {
    // A tripped trap is reported as success. Telling a bot which check caught
    // it is free tuning information; a person can never reach this branch.
    if ("discard" in parsed) return { status: "sent", errors: {} };
    return { status: "invalid", errors: parsed.errors, values };
  }

  if (throttled(await clientKey())) {
    return { status: "throttled", errors: {}, values };
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!key || !to || !from) {
    console.error(
      "[contact] Mail is not configured — set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL.",
    );
    return { status: "unconfigured", errors: {}, values };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // The whole point: replying goes to the sender, not to the robot
        // address the message was posted from.
        reply_to: parsed.message.email,
        subject: `${parsed.message.topic} — ${parsed.message.name}`,
        text: formatMessage(parsed.message),
      }),
      // A hung request would otherwise hold the action open until the platform
      // kills it, and the visitor would watch a spinner the whole time.
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(
        `[contact] Resend rejected the message: ${response.status} ${await response.text()}`,
      );
      return { status: "failed", errors: {}, values };
    }
  } catch (error) {
    console.error("[contact] Could not reach Resend:", error);
    return { status: "failed", errors: {}, values };
  }

  return { status: "sent", errors: {} };
}
