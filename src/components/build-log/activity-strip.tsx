"use client";

import { useMemo, useState } from "react";

import type { BuildLogEntry } from "@/data/build-log";
import { TYPE_META } from "@/lib/build-log-types";
import { cn } from "@/lib/utils";

/**
 * Every day of the log, as one cell each.
 *
 * A day with work done is lit in the colour of what was done that day; a quiet
 * day is a hairline. Pointing at a cell says what happened; pressing one jumps
 * to that day in the feed below. Built entirely from the entries' own dates —
 * there is no activity data anywhere else, and none is invented.
 */

const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parsed as UTC noon: a plain date string is UTC midnight, which lands on the
    previous day in any timezone behind it. */
const at = (date: string) => new Date(`${date}T12:00:00Z`).getTime();

const label = (time: number) => {
  const d = new Date(time);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

export function ActivityStrip({
  entries,
  onSelect,
}: {
  entries: BuildLogEntry[];
  /** Given the id of the first entry on the chosen day. */
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const days = useMemo(() => {
    const byDay = new Map<number, BuildLogEntry[]>();
    for (const entry of entries) {
      const key = at(entry.date);
      const list = byDay.get(key);
      if (list) list.push(entry);
      else byDay.set(key, [entry]);
    }

    const times = [...byDay.keys()].sort((a, b) => a - b);
    if (!times.length) return [];

    const run: { time: number; entries: BuildLogEntry[] }[] = [];
    for (let t = times[0]; t <= times[times.length - 1]; t += DAY) {
      run.push({ time: t, entries: byDay.get(t) ?? [] });
    }
    return run;
  }, [entries]);

  if (!days.length) return null;

  const first = days[0];
  const last = days[days.length - 1];
  const active = open != null ? days[open] : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="label text-faint">
          {label(first.time)} <span className="text-faint/60">&rarr;</span> {label(last.time)}
        </p>
        <p className="label text-faint" aria-live="polite">
          {active && active.entries.length ? (
            <>
              <span className="text-fg">{label(active.time)}</span>
              <span className="text-faint/60"> / </span>
              {active.entries.length} {active.entries.length === 1 ? "entry" : "entries"}
            </>
          ) : (
            <>
              <span className="text-fg tabular-nums">{days.filter((d) => d.entries.length).length}</span> active days
            </>
          )}
        </p>
      </div>

      <ol
        className="mt-3 flex items-end gap-[3px]"
        onPointerLeave={() => setOpen(null)}
      >
        {days.map((day, i) => {
          const count = day.entries.length;
          const tone = count ? TYPE_META[day.entries[0].type].color : undefined;
          const lit = open === i;
          return (
            <li key={day.time} className="min-w-0 flex-1">
              {count ? (
                <button
                  type="button"
                  onPointerEnter={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  onBlur={() => setOpen(null)}
                  onClick={() => onSelect(day.entries[0].id)}
                  className="block w-full cursor-pointer"
                >
                  <span className="sr-only">
                    {label(day.time)}: {count} {count === 1 ? "entry" : "entries"}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "block w-full transition-[height,opacity] duration-300 ease-[var(--ease-out-expo)]",
                      lit ? "opacity-100" : "opacity-80",
                    )}
                    style={{
                      height: `${Math.min(34, 12 + count * 9)}px`,
                      backgroundColor: tone,
                    }}
                  />
                </button>
              ) : (
                <span
                  aria-hidden
                  onPointerEnter={() => setOpen(i)}
                  className="block h-[6px] w-full bg-hairline-strong opacity-60"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
