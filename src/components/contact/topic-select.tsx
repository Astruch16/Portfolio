"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";

import { sequenceTone } from "@/components/case/sequence-tones";
import { TOPICS, type Topic } from "@/lib/contact-message";
import { cn } from "@/lib/utils";

/**
 * The "about" field.
 *
 * A native `<select>` hands its panel to the operating system, which on this
 * page meant a white system menu opening out of a black editorial form — the
 * one control that visibly did not belong to the site. Radix gives back the
 * panel without giving up the keyboard behaviour, typeahead or the hidden
 * native control that makes `FormData` work.
 *
 * Same panel language as the hero's stack runtime: dark ground, hairline, and
 * the shared `panel-in` / `panel-out` keyframes anchored to the trigger, so it
 * grows out of the field rather than appearing somewhere near it.
 *
 * A `<noscript>` fallback keeps the plain native control for anyone without
 * JavaScript — the rest of the form already works without it, and this field
 * would otherwise be the one thing that silently could not be filled in.
 */

/** What each option actually covers. The list alone leaves it to guesswork. */
const NOTES: Record<Topic, string> = {
  "A role": "Full-time, design engineering or product",
  "A product to build": "You have something that needs making",
  "Freelance work": "A defined piece of work, start to finish",
  "Something else": "Anything the three above don't cover",
};

export function TopicSelect({
  id,
  name,
  defaultValue,
  invalid,
  describedBy,
  onValueChange,
  className,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  invalid?: boolean;
  describedBy?: string;
  onValueChange: (value: string | undefined) => void;
  className?: string;
}) {
  return (
    <>
      <Select.Root
        name={name}
        required
        defaultValue={defaultValue || undefined}
        onValueChange={onValueChange}
      >
        <Select.Trigger
          id={id}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(
            "group flex w-full cursor-pointer items-center justify-between gap-4 border-0 border-b border-hairline-strong bg-transparent px-0 py-3 text-left font-sans text-[1rem] text-fg outline-none transition-colors",
            "focus-visible:border-accent data-[state=open]:border-accent",
            invalid && "border-[#e0a94f]",
            className,
          )}
        >
          {/* Placeholder is dimmed the way the textarea's is, so an untouched
              field reads as empty rather than as a chosen value. */}
          <Select.Value
            placeholder={<span className="text-faint">Choose one</span>}
          />
          <Select.Icon asChild>
            <ChevronDown
              aria-hidden
              strokeWidth={1.5}
              className="size-4 shrink-0 text-faint transition-transform duration-300 ease-[var(--ease-out-expo)] group-data-[state=open]:rotate-180 group-data-[state=open]:text-fg"
            />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={10}
            collisionPadding={16}
            data-surface="dark"
            style={{ transformOrigin: "var(--radix-select-content-transform-origin)" }}
            className="z-50 w-[var(--radix-select-trigger-width)] min-w-[16rem] overflow-hidden rounded-[6px] border border-hairline bg-bg shadow-[0_18px_44px_-14px_rgb(10_8_20/0.6)] data-closed:animate-[panel-out_150ms_var(--ease-out-quart)_both] data-open:animate-[panel-in_260ms_var(--ease-out-expo)_both]"
          >
            <Select.Viewport className="p-1.5">
              {TOPICS.map((topic, i) => (
                <Select.Item
                  key={topic}
                  value={topic}
                  className={cn(
                    "group/i relative flex cursor-pointer items-start gap-4 rounded-[3px] px-3.5 py-3 outline-none select-none",
                    "transition-colors data-highlighted:bg-fg/[0.055]",
                  )}
                >
                  {/* The accent rule marks the highlighted row rather than a
                      block of colour — the same move the nav and work rows use. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 left-0 block w-px origin-center scale-y-0 bg-accent transition-transform duration-200 ease-[var(--ease-out-expo)] group-data-highlighted/i:scale-y-100"
                  />

                  <span
                    className="label mt-[0.2rem] shrink-0"
                    style={{ color: sequenceTone(i, "var(--color-accent)") }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <Select.ItemText>
                      <span className="block text-[0.9375rem] leading-tight text-fg">
                        {topic}
                      </span>
                    </Select.ItemText>
                    <span className="mt-1.5 block font-mono text-[0.6875rem] leading-[1.5] tracking-[0.06em] text-faint uppercase">
                      {NOTES[topic]}
                    </span>
                  </span>

                  <Select.ItemIndicator asChild>
                    <Check
                      aria-hidden
                      strokeWidth={2}
                      className="mt-[0.15rem] size-3.5 shrink-0 text-signal"
                    />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {/* Inert while scripting is on, a real control when it is off. Written as
          markup rather than as children so React never tries to hydrate it. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<select name="${name}" required style="width:100%;padding:0.75rem 0;background:transparent;color:inherit;border:0;border-bottom:1px solid rgba(255,255,255,0.18);font:inherit">
  <option value="">Choose one</option>
  ${TOPICS.map((t) => `<option value="${t}">${t}</option>`).join("\n  ")}
</select>`,
        }}
      />
    </>
  );
}
