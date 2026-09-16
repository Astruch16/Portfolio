"use client";

import { PacketStream } from "@/components/contact/packet-stream";
import { draftStatus } from "@/lib/contact-message";
import { cn } from "@/lib/utils";

/**
 * The panel beside the form: what is being written, and where it's going.
 *
 * It began as a plain transcript of the draft. It now also shows the link
 * itself — a dish that catches a packet for every character typed — and a
 * signal meter with one bar per field, so filling the form reads as bringing a
 * channel up rather than as completing a form. The envelope underneath is still
 * the exact one that will be sent.
 *
 * A mirror, never a control: nothing here is focusable and nothing can be got
 * wrong. Hidden from assistive technology, which gets the fields themselves.
 */

export type Draft = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const STATUS = {
  empty: { label: "Awaiting input", tone: "var(--surface-faint)" },
  incomplete: { label: "Acquiring", tone: "#e0a94f" },
  ready: { label: "Ready to send", tone: "#b6e53b" },
} as const;

/** The four bars of the meter, in the order the form asks for them. */
const BARS: { key: keyof Draft; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "topic", label: "About" },
  { key: "message", label: "Message" },
];

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

export function UplinkPanel({ draft, sending }: { draft: Draft; sending?: boolean }) {
  const status = STATUS[draftStatus(draft)];
  const filled = BARS.filter(({ key }) => draft[key].trim().length > 0).length;

  return (
    <div aria-hidden className="relative">
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2.5">
        <p className="label text-fg">
          <span className="text-accent">Uplink</span>
          <span className="text-faint"> / </span>
          {sending ? "Transmitting" : "Draft"}
        </p>
        <span className="label flex shrink-0 items-center gap-2" style={{ color: status.tone }}>
          <span
            className={cn("block size-[5px] rounded-full", sending && "animate-ping")}
            style={{ backgroundColor: status.tone }}
          />
          {sending ? "Sending" : status.label}
        </span>
      </div>

      <div className="mt-4 border border-hairline-strong bg-void/60">
        {/* --- The link ------------------------------------------------------ */}
        <PacketStream className="block h-[8.5rem] w-full" />

        {/* --- Signal: one bar per field ------------------------------------- */}
        <div className="flex items-end gap-3 border-t border-hairline px-5 py-3.5">
          <span className="label shrink-0 text-faint">Signal</span>
          <span className="flex flex-1 items-end gap-1" role="presentation">
            {BARS.map(({ key, label }, i) => {
              const on = draft[key].trim().length > 0;
              return (
                <span
                  key={key}
                  title={label}
                  className="block h-[var(--h)] flex-1 transition-[background-color,opacity] duration-500"
                  style={
                    {
                      "--h": `${6 + i * 3}px`,
                      backgroundColor: on ? "var(--color-signal)" : "var(--surface-hairline-strong)",
                      opacity: on ? 1 : 0.5,
                    } as React.CSSProperties
                  }
                />
              );
            })}
          </span>
          <span className="label shrink-0 text-fg tabular-nums">{filled} / 4</span>
        </div>

        {/* --- The envelope --------------------------------------------------- */}
        <div className="border-t border-hairline px-5 py-5">
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
          <div className="mt-5 flex max-h-[11rem] min-h-[2.25rem] flex-col justify-end overflow-hidden border-t border-hairline pt-4">
            <p className="font-mono text-[0.75rem] leading-[1.75] tracking-[0.02em] break-words whitespace-pre-wrap text-muted">
              {draft.message}
              <span className="caret-blink ml-px inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-fg align-middle" />
            </p>
          </div>
        </div>
      </div>

      <p className="label mt-3 flex justify-between text-faint">
        <span>Plain text</span>
        <span className="tabular-nums">{draft.message.length} chars</span>
      </p>
    </div>
  );
}
