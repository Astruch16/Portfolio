"use client";

import { draftStatus } from "@/lib/contact-message";

/**
 * A live transcript of the message being written.
 *
 * The contact page had one working control and a large empty column beside it,
 * which read as unfinished next to the rest of the site. This fills that column
 * with something that earns its place: the exact envelope that will be sent,
 * assembling as it is typed.
 *
 * It is a mirror, never a control — no inputs, nothing focusable, nothing that
 * can be got wrong. The same terminal language as the hero and the case-study
 * diagrams, so the page belongs to the same site.
 */

export type Draft = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const STATUS = {
  empty: { label: "Awaiting input", tone: "var(--surface-faint)" },
  incomplete: { label: "Incomplete", tone: "#e0a94f" },
  ready: { label: "Ready to send", tone: "#b6e53b" },
} as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="label w-16 shrink-0 text-faint">{label}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-[0.75rem] tracking-[0.04em] text-fg">
        {value || <span className="text-faint">&mdash;</span>}
      </span>
    </div>
  );
}

export function Transmission({ draft }: { draft: Draft }) {
  const status = STATUS[draftStatus(draft)];
  const characters = draft.message.length;

  return (
    <div aria-hidden className="relative">
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2.5">
        <p className="label text-fg">
          <span className="text-accent">Transmission</span>
          <span className="text-faint"> / </span>
          Draft
        </p>
        <span className="label flex shrink-0 items-center gap-2" style={{ color: status.tone }}>
          <span
            className="block size-[5px] rounded-full"
            style={{ backgroundColor: status.tone }}
          />
          {status.label}
        </span>
      </div>

      <div className="mt-4 border border-hairline-strong bg-void/60 p-5">
        <p className="font-mono text-[0.75rem] tracking-[0.04em]">
          <span className="text-accent">&gt;</span>
          <span className="ml-2 text-muted">compose --to adam</span>
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Row label="From" value={draft.name} />
          <Row label="Reply" value={draft.email} />
          <Row label="About" value={draft.topic} />
        </div>

        {/* Hugs its content, then stops growing and keeps the tail in view, so
            the transcript follows the writing the way a terminal does — a fixed
            box would sit mostly empty for the first few lines. */}
        <div className="mt-5 flex max-h-[13rem] min-h-[2.25rem] flex-col justify-end overflow-hidden border-t border-hairline pt-4">
          <p className="font-mono text-[0.75rem] leading-[1.75] tracking-[0.02em] break-words whitespace-pre-wrap text-muted">
            {draft.message}
            <span className="caret-blink ml-px inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-fg align-middle" />
          </p>
        </div>
      </div>

      <p className="label mt-3 flex justify-between text-faint">
        <span>Plain text</span>
        <span className="tabular-nums">{characters} chars</span>
      </p>
    </div>
  );
}
