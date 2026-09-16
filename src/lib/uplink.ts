/**
 * The contact page's live link between the form and everything drawn around it.
 *
 * The form writes to it on every keystroke and whenever the draft's state
 * changes; the carrier wave behind the headline and the uplink panel beside the
 * fields read from it. Neither of those draws in React — they're canvases —
 * so this is a tiny store with a plain listener set rather than context.
 *
 * Keeping it here means the form doesn't have to know what's drawing, and the
 * canvases don't have to know anything about the form.
 */

export type UplinkPhase = "idle" | "writing" | "ready" | "sending" | "sent" | "failed";

export type UplinkState = {
  phase: UplinkPhase;
  /** Fields complete, of four. */
  filled: number;
  /** Characters in the message. */
  length: number;
};

type Listener = () => void;
/** A keystroke, for anything that wants to react to typing rather than state. */
type PulseListener = (strength: number) => void;

const INITIAL: UplinkState = { phase: "idle", filled: 0, length: 0 };

let state = INITIAL;
const listeners = new Set<Listener>();
const pulses = new Set<PulseListener>();

export const uplink = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot: () => state,
  getServerSnapshot: () => INITIAL,

  /** Listen for keystrokes. Separate from state: nothing re-renders on these. */
  onPulse(listener: PulseListener) {
    pulses.add(listener);
    return () => {
      pulses.delete(listener);
    };
  },

  set(next: Partial<UplinkState>) {
    const merged = { ...state, ...next };
    if (
      merged.phase === state.phase &&
      merged.filled === state.filled &&
      merged.length === state.length
    ) {
      return;
    }
    state = merged;
    for (const listener of listeners) listener();
  },

  /** One keystroke. `strength` is 0–1; a send is a whole lot at once. */
  pulse(strength = 1) {
    for (const listener of pulses) listener(strength);
  },

  reset() {
    state = INITIAL;
    for (const listener of listeners) listener();
  },
};
