import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { stackCategories } from "@/data/stack";
import { FORMS, type FormIndex } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";

export type Tone = "text" | "muted" | "accent" | "success" | "prompt";
export type Segment = { text: string; tone?: Tone };

/**
 * The hero's live terminal session.
 *
 * Behind the terminal under the hero's role: which tab it shows — one per stack
 * category, plus the session itself — and what has been typed into it. Answers
 * print in the session tab, and a command per form — design, build, ship, code,
 * measure, iterate — morphs the sculpture beside it.
 *
 * Every answer is read from the site's own data — projects, the stack, site
 * details — so the terminal can never say anything the rest of the site
 * doesn't. Commands that go somewhere say so, then hand back a route for the
 * caller to navigate to.
 *
 * A tiny external store rather than React state, shared by the prompt and the
 * log without either owning it.
 */

/** A stack category's id, or the session's own output. */
export type TerminalTab = (typeof stackCategories)[number]["id"] | "session";

type SessionState = {
  tab: TerminalTab;
  /** False until the visitor first touches the prompt. */
  live: boolean;
  history: Segment[][];
  input: string;
  /** Bumped to ask the prompt to take focus. */
  focusTick: number;
  /** Plain text of the last answer, for the screen-reader log. */
  announcement: string;
};

const PROMPT: Segment = { text: "$ ", tone: "prompt" };
const MAX_INPUT = 40;
const HISTORY_ROWS = 40;

export const COMMANDS = [
  { name: "help", hint: "list commands" },
  { name: "design", hint: "morph the sculpture" },
  { name: "build", hint: "morph the sculpture" },
  { name: "ship", hint: "morph the sculpture" },
  { name: "code", hint: "morph the sculpture" },
  { name: "measure", hint: "morph the sculpture" },
  { name: "iterate", hint: "morph the sculpture" },
  { name: "work", hint: "the projects" },
  { name: "open", hint: "open <project>" },
  { name: "stack", hint: "stack [frontend|backend|infra]" },
  { name: "about", hint: "who, what, where" },
  { name: "contact", hint: "get in touch" },
  { name: "clear", hint: "clear the screen" },
] as const;

const INITIAL: SessionState = {
  tab: stackCategories[0].id,
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

/** Finds a stack category from a typed name: "frontend", "back", "infra"… */
function category(query: string) {
  return query
    ? stackCategories.find((c) => c.id.startsWith(query) || c.label.toLowerCase().startsWith(query))
    : undefined;
}

function answer(raw: string): {
  lines: Segment[][];
  navigate?: string;
  clear?: boolean;
  /** Show this tab instead of the session. */
  tab?: TerminalTab;
} {
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

    case "stack": {
      const match = category(args.join(" "));
      if (match) return { lines: [[accent("→ "), { text: `cat ${match.path}` }]], tab: match.id };
      return {
        lines: stackCategories.map((c) => [
          accent(c.id.padEnd(16)),
          { text: c.entries.map((e) => e.name).join(", ") },
        ]),
      };
    }

    case "frontend":
    case "backend":
    case "infra":
    case "infrastructure": {
      const match = category(command)!;
      return { lines: [[accent("→ "), { text: `cat ${match.path}` }]], tab: match.id };
    }

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

    case "design":
    case "build":
    case "ship":
    case "code":
    case "measure":
    case "data":
    case "iterate": {
      // "data" was this form's first name; kept so it still answers.
      const name = command === "data" ? "measure" : command;
      const form = FORMS.findIndex((f) => f.toLowerCase() === name) as FormIndex;
      sculpture.choose(form);
      return { lines: [[accent("→ "), { text: `morphing to ${name}` }]] };
    }

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

  setTab(tab: TerminalTab) {
    if (tab !== state.tab) set({ tab });
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
      tab: result.tab ?? "session",
      input: "",
      announcement: result.lines.map((line) => line.map((s) => s.text).join("")).join(". "),
    });

    return result.navigate;
  },
};
