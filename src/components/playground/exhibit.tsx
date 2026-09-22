"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Lift } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * The frame every specimen is shown in.
 *
 * A plate for the piece itself, the controls beside it, and the note that says
 * what it is and where on the site it does its job. The same registration marks
 * and mono annotation the case studies use, so the playground reads as part of
 * the same drawing set rather than a separate toy box.
 */

export function Exhibit({
  index,
  title,
  where,
  href,
  note,
  controls,
  children,
  stageClassName,
}: {
  index: string;
  title: string;
  /** Where this piece works on the site, e.g. "The hero". */
  where: string;
  href: string;
  note: string;
  controls: React.ReactNode;
  children: React.ReactNode;
  stageClassName?: string;
}) {
  return (
    <section
      aria-labelledby={`specimen-${index}`}
      className="relative border-t border-hairline py-[clamp(3rem,8vh,5.5rem)]"
    >
      <div className="grid gap-x-[clamp(2rem,4vw,4.5rem)] gap-y-8 lg:grid-cols-12">
        {/* --- What it is ------------------------------------------------ */}
        <div className="lg:col-span-4">
          <Lift onView as="p" className="label text-faint">
            <span className="text-accent">{index}</span>
            <span className="text-faint/60"> / </span>
            Specimen
          </Lift>

          <Lift onView delay={0.06}>
            <h2
              id={`specimen-${index}`}
              className="display mt-4 text-[clamp(1.75rem,3vw,2.5rem)] leading-[0.95] text-fg"
            >
              {title}
            </h2>
          </Lift>

          <Lift onView delay={0.1} as="p" className="mt-5 max-w-[42ch] text-muted">
            {note}
          </Lift>

          <Lift onView delay={0.14}>
            <Link
              href={href}
              className="group/where label mt-6 inline-flex items-center gap-2.5 text-muted transition-colors hover:text-fg"
            >
              {where}
              <ArrowUpRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/where:-translate-y-0.5 group-hover/where:translate-x-0.5"
              />
            </Link>
          </Lift>

          <Lift onView delay={0.18} className="mt-8 border-t border-hairline pt-5">
            <p className="label text-faint">Controls</p>
            <div className="mt-5 grid gap-5">{controls}</div>
          </Lift>
        </div>

        {/* --- The piece itself ------------------------------------------ */}
        <Lift onView delay={0.1} className="lg:col-span-8">
          <div className="relative isolate">
            {[
              "-top-px -left-px border-t border-l",
              "-top-px -right-px border-t border-r",
              "-bottom-px -left-px border-b border-l",
              "-right-px -bottom-px border-r border-b",
            ].map((edge) => (
              <span
                key={edge}
                aria-hidden
                className={cn("absolute z-10 block size-3 border-accent", edge)}
              />
            ))}
            <div
              className={cn(
                "relative overflow-hidden border border-hairline-strong bg-void/40",
                stageClassName,
              )}
            >
              {children}
            </div>
          </div>
        </Lift>
      </div>
    </section>
  );
}

/* --- Controls ------------------------------------------------------------- */

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="label flex items-baseline justify-between gap-4 text-faint">
        {label}
        <span className="text-fg tabular-nums">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="playground-slider mt-3 w-full"
      />
    </label>
  );
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="label text-faint">{label}</p>
      <div role="group" aria-label={label} className="mt-3 flex flex-wrap gap-1">
        {options.map((option) => {
          const on = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option.id)}
              className={cn(
                "label border px-2.5 py-1.5 transition-colors",
                on
                  ? "border-hairline-strong bg-white/[0.05] text-fg"
                  : "border-transparent text-faint hover:text-muted",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/act label inline-flex w-fit items-center gap-3 border border-hairline-strong px-4 py-2.5 text-fg transition-colors hover:border-accent"
    >
      {label}
      <span
        aria-hidden
        className="block transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/act:translate-x-1"
      >
        &rarr;
      </span>
    </button>
  );
}
