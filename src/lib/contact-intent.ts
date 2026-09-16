import type { Topic } from "@/lib/contact-message";

/**
 * A topic picked from further down the contact page, for the form above it.
 *
 * The page lists what is worth writing about, then asks the visitor to scroll
 * back up and pick the matching option out of a dropdown. This lets a line in
 * that list do it for them: the list announces the choice here, the form takes
 * it and puts the cursor in the message.
 *
 * A counter rides along with the topic so choosing the same one twice still
 * counts as a new request — the second click should move the cursor too.
 */

export type Intent = { topic: Topic | null; at: number };

const INITIAL: Intent = { topic: null, at: 0 };

let state = INITIAL;
const listeners = new Set<() => void>();

export const contactIntent = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot: () => state,
  getServerSnapshot: () => INITIAL,

  choose(topic: Topic) {
    state = { topic, at: state.at + 1 };
    for (const listener of listeners) listener();
  },
};
