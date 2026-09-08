"use client";

import { ArrowRight, Check, TriangleAlert } from "lucide-react";
import { useActionState, useEffect, useId, useRef } from "react";

import { sendContactMessage } from "@/app/contact/actions";
import { initialContactState, LIMITS, TOPICS } from "@/lib/contact-message";
import { cn } from "@/lib/utils";

/**
 * The contact form.
 *
 * Fields are rules on the page rather than boxes on it: a mono label, the value
 * at reading size, and a hairline underneath that takes the accent on focus.
 * Nothing is a rounded input on a panel, because nothing else on this site is.
 *
 * Submits through a Server Action, so it still works with JavaScript disabled —
 * the enhancements layered on top (pending state, inline errors, the timing
 * trap) are all additive rather than load-bearing.
 */

const FIELD =
  "block w-full border-0 border-b border-hairline-strong bg-transparent px-0 py-3 font-sans text-[1rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-accent";

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label block text-faint">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="label mt-2.5 flex items-center gap-2 text-[#e0a94f]"
        >
          <TriangleAlert aria-hidden strokeWidth={1.6} className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** What the visitor is told when the message did not go anywhere. */
const FAILURE: Record<string, string> = {
  failed:
    "Something went wrong on my end and the message wasn't sent. Nothing was lost — try again in a moment, or reach me through one of the channels below.",
  unconfigured:
    "The form isn't connected to a mailbox yet, so this wouldn't have reached me. Use one of the channels below for now.",
  throttled:
    "That's a few messages in a short window. Give it a few minutes, or use one of the channels below.",
};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialContactState,
  );

  const id = useId();
  const field = (name: string) => `${id}-${name}`;

  // Absent without JavaScript, which the server reads as "cannot judge" rather
  // than as a bot. Only a suspiciously fast round trip is ever rejected.
  //
  // Written straight to the input rather than held in state: the value is never
  // rendered, so putting it through React would cost a second pass for nothing.
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  // Moves attention to the outcome; without it a screen reader user submits
  // and hears nothing change.
  const outcome = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status !== "idle" && state.status !== "invalid") {
      outcome.current?.focus();
    }
  }, [state.status]);

  if (state.status === "sent") {
    return (
      <div
        ref={outcome}
        tabIndex={-1}
        className="max-w-[52ch] border-l-2 border-signal py-1 pl-6 outline-none"
      >
        <p className="label flex items-center gap-2.5 text-signal">
          <Check aria-hidden strokeWidth={2} className="size-4" />
          Message sent
        </p>
        <p className="mt-4 text-lead text-muted">
          Thanks — it&rsquo;s in my inbox. I&rsquo;ll reply to the address you
          gave me, usually within a few days.
        </p>
      </div>
    );
  }

  const failure = FAILURE[state.status];

  return (
    <form action={formAction} className="max-w-[46rem]">
      {/* Hidden from people, irresistible to form-fillers. Not `display: none`
          — the bots worth catching skip anything that obviously invisible. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={field("company")}>Company</label>
        <input
          id={field("company")}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="" />

      <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
        <Field label="Name" htmlFor={field("name")} error={state.errors.name}>
          <input
            id={field("name")}
            name="name"
            type="text"
            required
            maxLength={LIMITS.name.max}
            autoComplete="name"
            defaultValue={state.values?.name}
            aria-invalid={Boolean(state.errors.name)}
            aria-describedby={state.errors.name ? `${field("name")}-error` : undefined}
            className={cn(FIELD, state.errors.name && "border-[#e0a94f]")}
          />
        </Field>

        <Field label="Email" htmlFor={field("email")} error={state.errors.email}>
          <input
            id={field("email")}
            name="email"
            type="email"
            required
            maxLength={LIMITS.email.max}
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(state.errors.email)}
            aria-describedby={state.errors.email ? `${field("email")}-error` : undefined}
            className={cn(FIELD, state.errors.email && "border-[#e0a94f]")}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="About" htmlFor={field("topic")} error={state.errors.topic}>
            <div className="relative">
              <select
                id={field("topic")}
                name="topic"
                required
                defaultValue={state.values?.topic ?? ""}
                aria-invalid={Boolean(state.errors.topic)}
                aria-describedby={
                  state.errors.topic ? `${field("topic")}-error` : undefined
                }
                className={cn(
                  FIELD,
                  "cursor-pointer appearance-none pr-8",
                  state.errors.topic && "border-[#e0a94f]",
                )}
              >
                <option value="" disabled>
                  Choose one
                </option>
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic} className="bg-void text-fg">
                    {topic}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-1 block size-2 -translate-y-2/3 rotate-45 border-r border-b border-current text-faint"
              />
            </div>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Message"
            htmlFor={field("message")}
            error={state.errors.message}
          >
            <textarea
              id={field("message")}
              name="message"
              required
              rows={6}
              minLength={LIMITS.message.min}
              maxLength={LIMITS.message.max}
              defaultValue={state.values?.message}
              placeholder="What are you building, and where do I come in?"
              aria-invalid={Boolean(state.errors.message)}
              aria-describedby={
                state.errors.message ? `${field("message")}-error` : undefined
              }
              className={cn(
                FIELD,
                "resize-y leading-[1.65]",
                state.errors.message && "border-[#e0a94f]",
              )}
            />
          </Field>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="submit"
          disabled={pending}
          className="group/s label inline-flex items-center gap-3 bg-fg px-6 py-3.5 text-bg transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-55"
        >
          {pending ? "Sending" : "Send message"}
          <ArrowRight
            aria-hidden
            strokeWidth={1.5}
            className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/s:translate-x-1"
          />
        </button>

        {state.status === "invalid" ? (
          <p className="label text-[#e0a94f]">Check the fields above.</p>
        ) : null}
      </div>

      {failure ? (
        <div
          ref={outcome}
          tabIndex={-1}
          className="mt-8 max-w-[52ch] border-l-2 border-[#e0a94f] py-1 pl-6 outline-none"
        >
          <p className="text-lead text-muted">{failure}</p>
        </div>
      ) : null}

      {/* One announcement for anything that isn't a field-level error. */}
      <p aria-live="polite" className="sr-only">
        {pending ? "Sending your message" : (failure ?? "")}
      </p>
    </form>
  );
}
