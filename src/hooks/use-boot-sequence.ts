"use client";

import { useEffect, useState } from "react";

/**
 * The hero assembles itself in ordered beats. A blinking prompt appears, the
 * name and role write themselves out beneath it, the prompt then travels down
 * the page and writes the statement, and the metadata and set arrive last.
 *
 * Milliseconds from mount. Adjust pacing here — the components only ever ask
 * "have we reached step X yet".
 */
const AT = [
  0, //    caret     prompt appears and blinks
  500, //  name      ADAM
  780, //  surname   STRUCH
  1260, // role      Design Engineer & Full-Stack Developer
  1980, // stack     "> load stack", then STACK.RUNTIME resolves
  2600, // travel    prompt moves down to the statement
  3060, // design    I DESIGN IT
  3520, // build     I BUILD IT
  3940, // ship      I SHIP IT
  4380, // done      prompt retires; metadata and set arrive
] as const;

export const STEP = {
  caret: 0,
  name: 1,
  surname: 2,
  role: 3,
  stack: 4,
  travel: 5,
  design: 6,
  build: 7,
  ship: 8,
  done: 9,
} as const;

/**
 * Returns the index of the beat currently reached.
 *
 * State changes exactly ten times across the whole intro — the per-character
 * staggering is done in CSS, not here, so a busy main thread can delay a beat
 * but can never make the typing itself stutter.
 */
export function useBootSequence(enabled: boolean): number {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let current = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;

      let next = 0;
      for (let i = 0; i < AT.length; i += 1) {
        if (elapsed >= AT[i]) next = i;
      }

      if (next !== current) {
        current = next;
        setStep(next);
      }

      if (next >= AT.length - 1) return;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  return step;
}
