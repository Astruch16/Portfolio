"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { FORMS, type FormIndex } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";
import { cn } from "@/lib/utils";

/**
 * The statement, as one live line: I [verb] it.
 *
 * It used to be three fixed lines stacked on a spine — design, build, ship —
 * which said the thing once and then sat there. Now the verb is whatever the
 * sculpture beside it is holding, and changes when the sculpture does: the old
 * letters dissolve into the same code symbols the name is built from and
 * resolve, left to right, into the new word.
 *
 * Under it, every form on a rail. The one being held carries a bar that fills
 * over exactly how long it will hold, read from the store the cycle itself runs
 * on, so the bar and the cycle can't disagree. The rail is the control: press a
 * verb and the sculpture takes that form, and holds it longer than the cycle
 * would.
 *
 * The line is a picture of a sentence, so screen readers get the sentence.
 */

const GLYPHS = Array.from("{}[]<>/\\|;=+*&^%$#@!?~");
const SETTLE_MS = 90;
const STAGGER_MS = 55;

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** The verb, decoding through code symbols whenever it changes. */
function Verb({ word, animate }: { word: string; animate: boolean }) {
  const slot = useRef<HTMLSpanElement>(null);
  const node = useRef<HTMLSpanElement>(null);
  const sizers = useRef<Record<string, HTMLSpanElement | null>>({});
  const shown = useRef(word);

  // The slot is as wide as the word it's resolving to, and eases between
  // widths, so "it." glides to the new word instead of jumping — and never sits
  // stranded after a short verb in a slot sized for the longest one.
  useEffect(() => {
    const el = slot.current;
    if (!el) return;
    const fit = (instant: boolean) => {
      const target = sizers.current[word]?.getBoundingClientRect().width;
      if (!target) return;
      if (instant || !animate) el.style.transition = "none";
      el.style.width = `${target}px`;
      if (instant || !animate) {
        void el.offsetWidth;
        el.style.transition = "";
      }
    };
    fit(false);
    // The display size follows the viewport; refit without easing when it does.
    const observer = new ResizeObserver(() => fit(true));
    const measure = sizers.current[FORMS[0]];
    if (measure) observer.observe(measure);
    return () => observer.disconnect();
  }, [word, animate]);

  useEffect(() => {
    const el = node.current;
    if (!el || word === shown.current) return;
    const from = shown.current;
    shown.current = word;
    if (!animate) {
      el.textContent = word;
      return;
    }

    const length = Math.max(from.length, word.length);
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      let text = "";
      let done = true;
      for (let i = 0; i < length; i += 1) {
        const settleAt = SETTLE_MS + i * STAGGER_MS;
        if (elapsed >= settleAt) {
          text += word[i] ?? "";
        } else {
          done = false;
          // Letters the new word has become noise until they resolve; letters
          // only the old word had flicker briefly, then drop away.
          if (i < word.length || elapsed < settleAt * 0.5) {
            text += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
        }
      }
      el.textContent = text;
      if (!done) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [word, animate]);

  return (
    <span
      ref={slot}
      className="relative inline-block overflow-visible align-bottom whitespace-nowrap transition-[width] duration-500 ease-[var(--ease-out-expo)]"
    >
      {/* Invisible copies of every verb, only for measuring. */}
      {FORMS.map((form) => (
        <span
          key={form}
          ref={(el) => {
            sizers.current[form] = el;
          }}
          aria-hidden
          className="invisible absolute top-0 left-0"
        >
          {form}
        </span>
      ))}
      <span ref={node} className="text-accent">
        {word}
      </span>
    </span>
  );
}

export function HeroStatement({
  visible,
  railVisible,
  animate,
  ref,
  className,
}: {
  /** The line itself: shown once the boot reaches it. */
  visible: boolean;
  /** The rail: shown once the boot has finished. */
  railVisible: boolean;
  /** False under reduced motion: no decoding, no filling bar. */
  animate: boolean;
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
}) {
  const state = useSyncExternalStore(sculpture.subscribe, sculpture.getSnapshot, sculpture.getServerSnapshot);

  return (
    <div ref={ref} className={className}>
      <p className="sr-only">I design it, build it and ship it.</p>

      <p
        aria-hidden
        className={cn(
          "font-mono text-[clamp(1.9rem,4.1vw,3.85rem)] leading-[0.95] font-semibold tracking-[-0.04em] [word-spacing:-0.3em] whitespace-nowrap text-fg uppercase transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        I <Verb word={FORMS[state.form]} animate={animate} /> it.
      </p>

      <ol
        aria-label="What I do — each one also shapes the sculpture"
        className={cn(
          "mt-[clamp(1.1rem,2.6vh,1.6rem)] grid grid-cols-3 gap-x-5 gap-y-2.5 transition-opacity duration-700 sm:flex sm:flex-wrap sm:gap-x-6",
          railVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {FORMS.map((form, i) => {
          const on = i === state.form;
          return (
            <li key={form}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => sculpture.choose(i as FormIndex)}
                className={cn(
                  "group/verb relative block pb-2 text-left font-mono text-[0.6875rem] tracking-[0.14em] uppercase transition-colors",
                  on ? "text-fg" : "text-faint hover:text-muted",
                )}
              >
                <span className={on ? "text-accent" : undefined}>{pad(i)}</span> {form}
                {/* The track, and — on the held form — how long it holds. */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 block h-px bg-hairline" />
                {on ? (
                  <span
                    // Keyed on when the form changed, so the fill restarts from
                    // empty every time instead of carrying on from wherever the
                    // previous one had reached.
                    key={state.changedAt}
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 block h-px origin-left bg-accent"
                    style={
                      animate
                        ? { animation: `statement-dwell ${state.dwell}ms linear both` }
                        : undefined
                    }
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
