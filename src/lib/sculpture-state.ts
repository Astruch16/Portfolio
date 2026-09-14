import type { FormIndex } from "@/lib/sculpture-forms";

/**
 * Which form the hero sculpture is holding, and who asked for it.
 *
 * Several things can ask: the boot sequence as it writes each line of the
 * statement, an idle cycle once it's done, and the visitor — by hovering a
 * statement line, pressing a form tab, or typing a command. A visitor's choice
 * always wins; the automatic sources back off for a while after one.
 *
 * A tiny external store, so the 3D scene can read it inside its render loop
 * without re-rendering while everything else subscribes normally.
 */

type State = {
  form: FormIndex;
  /** Bumped to scatter the sculpture. */
  burst: number;
  /** When the visitor last chose a form, for backing the automatic sources off. */
  chosenAt: number;
};

/** How long a visitor's choice holds before the idle cycle may move on. */
const HOLD_MS = 12000;

const INITIAL: State = { form: 0, burst: 0, chosenAt: 0 };

let state = INITIAL;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

export const sculpture = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
  getServerSnapshot: () => INITIAL,

  /** A visitor's choice. */
  choose(form: FormIndex) {
    set({ form, chosenAt: performance.now() });
  },

  /** The boot sequence or the idle cycle. Ignored while a choice is holding. */
  suggest(form: FormIndex) {
    if (state.chosenAt && performance.now() - state.chosenAt < HOLD_MS) return;
    if (form !== state.form) set({ form });
  },

  scatter() {
    set({ burst: state.burst + 1 });
  },
};
