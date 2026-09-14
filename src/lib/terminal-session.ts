import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { stackCategories } from "@/data/stack";
import { TERMINAL_ROWS, type Segment, type TerminalFrame } from "@/data/terminal-script";

/**
 * The hero's live terminal session.
 *
 * Until a visitor touches the prompt, the laptop plays its scripted build. The
 * moment they focus it or type, the screen becomes theirs: what they type is
 * echoed on the laptop as they type it, and a command prints its answer there.
 *
 * Every answer is read from the site's own data — projects, the stack, site
 * details — so the terminal can never say anything the rest of the site
 * doesn't. Commands that go somewhere say so, then hand back a route for the
 * caller to navigate to.
 *
 * A tiny external store rather than React state: the 3D scene reads it inside
 * its render loop without re-rendering, while the prompt and the static
 * fallback subscribe with `useSyncExternalStore`.
 */

type SessionState = {
  /** False until the visitor first touches the prompt; the script plays until then. */
  live: boolean;
  history: Segment[][];
  input: string;
  /** Bumped to ask the prompt to take focus — e.g. when the laptop is clicked. */
  focusTick: number;
  /** Plain text of the last answer, for the screen-reader log. */
  announcement: string;
};

const PROMPT: Segment = { text: "$ ", tone: "prompt" };
const MAX_INPUT = 40;
/** One row is kept for the prompt line itself. */
const HISTORY_ROWS = TERMINAL_ROWS - 1;

export const COMMANDS = [
  { name: "help", hint: "list commands" },
  { name: "work", hint: "the projects" },
  { name: "open", hint: "open <project>" },
  { name: "stack", hint: "what I build with" },
  { name: "about", hint: "who, what, where" },
  { name: "contact", hint: "get in touch" },
  { name: "clear", hint: "clear the screen" },
] as const;

const INITIAL: SessionState = {
  live: false,
  history: [],
  input: "",
  focusTick: 0,
  announcement: "",
};

let state = INITIAL;
const listeners = new Set<() => void>();

function set(next: Partial<SessionState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

const muted = (text: string): Segment => ({ text, tone: "muted" });
const accent = (text: string): Segment => ({ text, tone: "accent" });

function answer(raw: string): { lines: Segment[][]; navigate?: string; clear?: boolean } {
  const [command = "", ...args] = raw.trim().toLowerCase().split(/\s+/);

  switch (command) {
    case "":
      return { lines: [] };

    case "help":
      return {
        lines: [
          [muted("available commands")],
          ...COMMANDS.map((c) => [accent(c.name.padEnd(10)), muted(c.hint)]),
        ],
      };

    case "work":
    case "ls":
    case "projects":
      return {
        lines: [
          ...projects.map((p) => [
            muted(`${p.index}  `),
            { text: p.name.padEnd(16) },
            p.status ? { text: p.status.toLowerCase(), tone: "success" as const } : muted("—"),
          ]),
          [],
          [muted("open a project: "), accent("open " + projects[0].slug)],
        ],
      };

    case "open":
    case "cd": {
      const query = args.join(" ");
      const match = query
        ? projects.find(
            (p) => p.slug.startsWith(query) || p.name.toLowerCase().startsWith(query),
          )
        : undefined;
      if (!match) {
        return {
          lines: [
            [muted(query ? `no project matching "${query}"` : "open which project?")],
            [muted("try "), accent("work")],
          ],
        };
      }
      return {
        lines: [[accent("→ "), { text: `opening /work/${match.slug}` }]],
        navigate: `/work/${match.slug}`,
      };
    }

    case "stack":
      return {
        lines: stackCategories.map((category) => [
          accent(category.label.toLowerCase().padEnd(16)),
          { text: category.entries.map((e) => e.name).join(", ") },
        ]),
      };

    case "about":
    case "whoami":
      return {
        lines: [
          [{ text: site.name }],
          [muted(site.role)],
          [muted(`${site.location.city} · `), { text: site.status.available.toLowerCase(), tone: "success" }],
        ],
      };

    case "contact":
      return {
        lines: [[accent("→ "), { text: "opening /contact" }]],
        navigate: "/contact",
      };

    case "clear":
      return { lines: [], clear: true };

    default:
      return {
        lines: [[muted(`command not found: ${command}`)], [muted("try "), accent("help")]],
      };
  }
}

export const terminalSession = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot: () => state,
  getServerSnapshot: () => INITIAL,

  /** Takes the screen over from the script, the first time only. */
  activate() {
    if (state.live) return;
    set({
      live: true,
      history: [[muted("interactive session — type "), accent("help")], []],
    });
  },

  setInput(value: string) {
    if (!state.live) terminalSession.activate();
    set({ input: value.replace(/[^\x20-\x7e]/g, "").slice(0, MAX_INPUT) });
  },

  requestFocus() {
    set({ focusTick: state.focusTick + 1 });
  },

  /** Runs the current input. Returns a route when the command goes somewhere. */
  run(): string | undefined {
    if (!state.live) terminalSession.activate();
    const raw = state.input.trim();
    const result = answer(raw);

    const history = result.clear
      ? []
      : [...state.history, [PROMPT, { text: raw }], ...result.lines, ...(raw ? [[]] : [])];

    set({
      history: history.slice(-HISTORY_ROWS),
      input: "",
      announcement: result.lines.map((line) => line.map((s) => s.text).join("")).join(". "),
    });

    return result.navigate;
  },
};

/** What the laptop should show for this session, or null to keep the script. */
export function sessionFrame(session: SessionState): TerminalFrame | null {
  if (!session.live) return null;

  const lines = [...session.history, [PROMPT, { text: session.input }]].slice(-TERMINAL_ROWS);
  return {
    lines,
    caretRow: lines.length - 1,
    caretCol: PROMPT.text.length + session.input.length,
    finished: true,
  };
}
