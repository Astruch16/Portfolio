import { FORMS, type FormIndex } from "@/lib/sculpture-forms";

/**
 * Which form the hero sculpture is holding, who asked for it, and for how long.
 *
 * Several things can ask: the boot sequence as it writes the statement, the
 * idle cycle once it's done, and the visitor — through the statement's form
 * rail or a typed command. A visitor's choice always wins, and holds longer
 * than an automatic step.
 *
 * `changedAt` and `dwell` are what let the statement draw a bar that fills
 * until the next change: the cycle itself runs off the same two numbers, so the
 * bar can never disagree with it.
 *
 * A tiny external store, so the 3D scene can read it inside its render loop
 * without re-rendering while everything else subscribes normally.
 */

/** How long an automatic step holds before the cycle moves on. */
export const CYCLE_MS = 6500;
/** How long a visitor's choice holds. */
export const HOLD_MS = 12000;

type State = {
  form: FormIndex;
  /** Bumped to scatter the sculpture. */
  burst: number;
  /** When the form last changed, on the `performance.now()` clock. */
  changedAt: number;
  /** How long this form holds before the cycle may move on. */
  dwell: number;
  /** Whether the visitor picked this form. */
  chosen: boolean;
};

const INITIAL: State = { form: 0, burst: 0, changedAt: 0, dwell: CYCLE_MS, chosen: false };

let state = INITIAL;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

const holding = (now: number) => state.chosen && now - state.changedAt < state.dwell;

export const sculpture = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
  getServerSnapshot: () => INITIAL,

  /** A visitor's choice. Re-choosing the held form restarts its hold. */
  choose(form: FormIndex) {
    set({ form, changedAt: performance.now(), dwell: HOLD_MS, chosen: true });
  },

  /** The boot sequence. Ignored while a visitor's choice is holding. */
  suggest(form: FormIndex) {
    const now = performance.now();
    if (holding(now) || form === state.form) return;
    set({ form, changedAt: now, dwell: CYCLE_MS, chosen: false });
  },

  /** Moves the idle cycle on, once the current form has held for its dwell. */
  tick() {
    const now = performance.now();
    if (now - state.changedAt < state.dwell) return;
    set({
      form: ((state.form + 1) % FORMS.length) as FormIndex,
      changedAt: now,
      dwell: CYCLE_MS,
      chosen: false,
    });
  },

  scatter() {
    set({ burst: state.burst + 1 });
  },
};
