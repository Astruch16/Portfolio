/**
 * Validation and shaping for a contact message.
 *
 * Deliberately framework-free and dependency-free: this is four fields, and a
 * schema library would be a runtime dependency to express rules that read more
 * clearly as code. It is also the only place the rules live — the client uses
 * native HTML validation for the fast feedback, but nothing is trusted until it
 * has been through here on the server.
 */

export const TOPICS = [
  "A role",
  "A product to build",
  "Freelance work",
  "Something else",
] as const;

export type Topic = (typeof TOPICS)[number];

export type ContactMessage = {
  name: string;
  email: string;
  topic: Topic;
  message: string;
};

export type FieldErrors = Partial<Record<keyof ContactMessage, string>>;

export const LIMITS = {
  name: { min: 2, max: 80 },
  /** The practical maximum length of an address. */
  email: { max: 254 },
  message: { min: 20, max: 4000 },
} as const;

/**
 * Deliberately permissive. Address syntax is far stranger than most patterns
 * allow, and rejecting a valid address is worse than accepting an invalid one
 * that simply bounces — the only real test is whether mail arrives.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export type ParseResult =
  | { ok: true; message: ContactMessage }
  | { ok: false; errors: FieldErrors }
  /** A bot tripped a trap. Handled as success upstream so it learns nothing. */
  | { ok: false; discard: true; errors: FieldErrors };

export function parseContactMessage(form: FormData): ParseResult {
  // The honeypot: a field hidden from people and irresistible to form-fillers.
  // Anything in it means the submission was not typed by a human.
  if (text(form.get("company"))) {
    return { ok: false, discard: true, errors: {} };
  }

  // Set on mount by the client, so it is absent when JavaScript is off — which
  // is a person the form still has to work for, not a bot. Only a present and
  // implausibly fast value is treated as automated.
  const started = Number(text(form.get("startedAt")));
  if (started > 0 && Date.now() - started < 2500) {
    return { ok: false, discard: true, errors: {} };
  }

  const name = text(form.get("name"));
  const email = text(form.get("email"));
  const topic = text(form.get("topic"));
  const message = text(form.get("message"));

  const errors: FieldErrors = {};

  if (name.length < LIMITS.name.min) {
    errors.name = "Tell me who you are.";
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Keep this under ${LIMITS.name.max} characters.`;
  }

  if (!email) {
    errors.email = "I need somewhere to reply.";
  } else if (email.length > LIMITS.email.max || !EMAIL.test(email)) {
    errors.email = "That address doesn't look right.";
  }

  if (!TOPICS.includes(topic as Topic)) {
    errors.topic = "Pick the closest one.";
  }

  if (message.length < LIMITS.message.min) {
    errors.message = `A little more detail — ${LIMITS.message.min} characters or so.`;
  } else if (message.length > LIMITS.message.max) {
    errors.message = `That's over ${LIMITS.message.max} characters. Send the short version.`;
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return { ok: true, message: { name, email, topic: topic as Topic, message } };
}

/**
 * The result of a submission.
 *
 * Lives here rather than beside the action: a `"use server"` module may only
 * export async functions, so a plain object exported from one arrives on the
 * client as undefined — which fails at the first property read, during
 * prerender, with no hint as to why.
 */
export type ContactState = {
  status: "idle" | "sent" | "invalid" | "failed" | "unconfigured" | "throttled";
  errors: FieldErrors;
  /** Echoed back so a rejected form does not lose what was typed. */
  values?: { name: string; email: string; topic: string; message: string };
};

export const initialContactState: ContactState = { status: "idle", errors: {} };

/** The plain-text body of the notification. No HTML: this is a machine note. */
export function formatMessage(
  message: ContactMessage,
  receivedAt = new Date(),
): string {
  const when = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    dateStyle: "full",
    timeStyle: "short",
  }).format(receivedAt);

  return [
    `From:    ${message.name} <${message.email}>`,
    `About:   ${message.topic}`,
    `Sent:    ${when} (America/Vancouver)`,
    "",
    "-".repeat(56),
    "",
    message.message,
  ].join("\n");
}
