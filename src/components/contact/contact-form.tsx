"use client";

import { ArrowRight, Check, TriangleAlert } from "lucide-react";
import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";

import { sendContactMessage } from "@/app/contact/actions";
import { sequenceTone } from "@/components/case/sequence-tones";
import { Transmission, type Draft } from "@/components/contact/transmission";
import { Magnetic } from "@/components/motion/magnetic";
import { Lift } from "@/components/motion/reveal";
import { initialContactState, LIMITS, TOPICS } from "@/lib/contact-message";
import { cn } from "@/lib/utils";

/**
 * The contact form.
 *
 * Fields are rules on the page rather than boxes on it: an indexed mono label
 * colour-coded from the same legend the case studies number their chapters
 * with, the value at reading size, and a hairline underneath that takes the
 * accent on focus. Nothing is a rounded input on a panel, because nothing else
 * on this site is.
 *
 * Beside it, the transmission panel mirrors the envelope as it is written. The
 * draft is read straight off the form on input rather than held per field, so
 * the inputs stay uncontrolled and a rejected submission keeps what was typed.
 *
 * Submits through a Server Action, so it still works with JavaScript disabled —
 * the enhancements layered on top (pending state, inline errors, the timing
 * trap) are all additive rather than load-bearing.
 */

const FIELD =
  "block w-full border-0 border-b border-hairline-strong bg-transparent px-0 py-3 font-sans text-[1rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-accent";

function Field({
  index,
  label,
  error,
  htmlFor,
  meta,
  children,
}: {
  index: number;
  label: string;
  error?: string;
  htmlFor: string;
  /** Optional right-aligned readout, e.g. a character count. */
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="label block text-faint">
          <span style={{ color: sequenceTone(index, "var(--color-accent)") }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-faint/60"> / </span>
          {label}
        </label>
        {meta}
      </div>
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

/** Every one of these is checkable against the action beside this file. */
const AFTERWARDS = [
  "Straight to a private mailbox",
  "No database, no list, no follow-up sequence",
  "A reply from a person, usually within a few days",
] as const;

/** Registration crosshairs, centred on the corners of the plate. */
const CORNERS = [
  "-top-1.5 -left-1.5",
  "-top-1.5 -right-1.5",
  "-bottom-1.5 -left-1.5",
  "-bottom-1.5 -right-1.5",
] as const;

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialContactState,
  );

  const id = useId();
  const field = (name: string) => `${id}-${name}`;

  // Read off the form on input rather than held per field: the inputs stay
  // uncontrolled, so `defaultValue` still restores a rejected submission, and
  // the panel beside them still updates on every keystroke.
  const [draft, setDraft] = useState<Draft>({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const readDraft = useCallback((form: HTMLFormElement) => {
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "");
    setDraft({
      name: value("name"),
      email: value("email"),
      topic: value("topic"),
      message: value("message"),
    });
  }, []);

  // Absent without JavaScript, which the server reads as "cannot judge" rather
  // than as a bot. Only a suspiciously fast round trip is ever rejected.
  //
  // Written straight to the input rather than held in state: the value is never
  // rendered, so putting it through React would cost a second pass for nothing.
  const startedAt = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
    // A rejected submission comes back with values restored; the panel has to
    // catch up with them, and a browser-restored draft on reload too.
    if (form.current) readDraft(form.current);
  }, [readDraft]);

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
        className="relative outline-none"
      >
        {CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={cn("exhibit-mark absolute z-10 block size-3", corner)}
          />
        ))}
        <div className="border border-hairline-strong bg-void/60 px-8 py-[clamp(3rem,9vh,5rem)] sm:px-12">
          <p className="label flex items-center gap-2.5 text-signal">
            <Check aria-hidden strokeWidth={2} className="size-4" />
            Transmission complete
          </p>
          <p className="display mt-7 max-w-[18ch] text-[clamp(1.75rem,4vw,3rem)] leading-[1.02] text-fg">
            Message sent.
          </p>
          <p className="mt-6 max-w-[46ch] text-lead text-muted">
            Thanks &mdash; it&rsquo;s in my inbox. I&rsquo;ll reply to the
            address you gave me, usually within a few days.
          </p>
        </div>
      </div>
    );
  }

  const failure = FAILURE[state.status];
  const remaining = LIMITS.message.max - draft.message.length;

  return (
    <div className="shell-grid gap-y-[clamp(3rem,7vh,4.5rem)]">
      <div className="relative col-span-12 lg:col-span-7">
        {/* The same registration crosshairs the case-study exhibits use, so the
            form reads as another plate in the set rather than a bare column. */}
        {CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={cn("exhibit-mark absolute z-10 block size-3", corner)}
          />
        ))}

        <form
          ref={form}
          action={formAction}
          onInput={(event) => readDraft(event.currentTarget)}
          onChange={(event) => readDraft(event.currentTarget)}
          className="border border-hairline-strong bg-void/40 px-6 py-8 sm:px-10 sm:py-10"
        >
          {/* Hidden from people, irresistible to form-fillers. Not `display:
              none` — the bots worth catching skip anything that obviously
              invisible. */}
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
            <Lift onView delay={0.04}>
              <Field index={0} label="Name" htmlFor={field("name")} error={state.errors.name}>
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
            </Lift>

            <Lift onView delay={0.1}>
              <Field index={1} label="Email" htmlFor={field("email")} error={state.errors.email}>
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
            </Lift>

            <Lift onView delay={0.16} className="sm:col-span-2">
              <Field index={2} label="About" htmlFor={field("topic")} error={state.errors.topic}>
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
            </Lift>

            <Lift onView delay={0.22} className="sm:col-span-2">
              <Field
                index={3}
                label="Message"
                htmlFor={field("message")}
                error={state.errors.message}
                meta={
                  // Only once it could plausibly matter — a counter sitting at
                  // its maximum before anyone types is noise.
                  draft.message.length > LIMITS.message.max / 2 ? (
                    <span
                      className="label tabular-nums"
                      style={{ color: remaining < 100 ? "#e0a94f" : "var(--surface-faint)" }}
                    >
                      {remaining} left
                    </span>
                  ) : null
                }
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
            </Lift>
          </div>

          <Lift onView delay={0.28} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* The one control on the page, so it gets the pull the monogram
                gets — small enough that it never leaves the cursor. */}
            <Magnetic strength={0.15} radius={72} className="inline-block">
              <button
                type="submit"
                disabled={pending}
                className="group/s label inline-flex items-center gap-3 bg-fg px-7 py-4 text-bg transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-55"
              >
                {pending ? "Sending" : "Send message"}
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/s:translate-x-1"
                />
              </button>
            </Magnetic>

            {state.status === "invalid" ? (
              <p className="label text-[#e0a94f]">Check the fields above.</p>
            ) : null}
          </Lift>

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
      </div>

      {/* Below lg the panel would push the send button off the end of a phone
          for no gain — the form is the functional half. */}
      <aside className="col-span-12 hidden lg:col-span-5 lg:block">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
          <Lift onView delay={0.34}>
            <Transmission draft={draft} />
          </Lift>

          {/* What the form actually does with a message. The reason this page
              has a form instead of an address is privacy, so it is worth
              saying what happens next rather than leaving it implied. */}
          <Lift onView delay={0.4} className="mt-12">
            <p className="label border-b border-hairline pb-2.5 text-faint">
              After you send
            </p>
            <ul className="mt-5 flex flex-col gap-3.5">
              {AFTERWARDS.map((line, i) => (
                <li key={line} className="flex gap-4">
                  <span
                    className="label shrink-0"
                    style={{ color: sequenceTone(i, "var(--color-accent)") }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.75rem] leading-[1.6] tracking-[0.04em] text-muted">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </Lift>
        </div>
      </aside>
    </div>
  );
}
