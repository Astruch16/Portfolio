/**
 * What the laptop screen is running.
 *
 * Deliberately impersonal: this is a developer building a web app, nothing
 * about who that developer is. Keep it that way — no name, no project claims,
 * no metrics. Editing this file is the only thing needed to change what the
 * hero screen says; nothing here knows about three.js or canvases.
 */

export type Tone = "text" | "muted" | "accent" | "success" | "prompt";

export type Segment = { text: string; tone?: Tone };

export type Step =
  | { kind: "command"; segments: Segment[]; pauseAfter?: number }
  | { kind: "output"; segments: Segment[]; pauseAfter?: number }
  | { kind: "blank"; pauseAfter?: number };

/** Milliseconds per character while a command is being "typed". */
export const CHAR_MS = 34;

const prompt: Segment = { text: "$ ", tone: "prompt" };
const tick: Segment = { text: "✓ ", tone: "success" };

const info: Segment = { text: "info  ", tone: "accent" };
const event: Segment = { text: "event ", tone: "accent" };
const wait: Segment = { text: "wait  ", tone: "accent" };
const dash: Segment = { text: "- ", tone: "muted" };

export const terminalScript: Step[] = [
  /* --- dev server -------------------------------------------------------- */
  { kind: "command", segments: [prompt, { text: "npm run dev" }], pauseAfter: 340 },
  { kind: "blank", pauseAfter: 70 },
  {
    kind: "output",
    segments: [{ text: "> next dev --turbopack", tone: "muted" }],
    pauseAfter: 420,
  },
  { kind: "blank", pauseAfter: 60 },
  {
    kind: "output",
    segments: [info, dash, { text: "Starting development server..." }],
    pauseAfter: 320,
  },
  {
    kind: "output",
    segments: [info, dash, { text: "Loading env from .env.local" }],
    pauseAfter: 300,
  },
  {
    kind: "output",
    segments: [
      info,
      dash,
      { text: "Local:   " },
      { text: "http://localhost:3000", tone: "accent" },
    ],
    pauseAfter: 420,
  },
  { kind: "blank", pauseAfter: 60 },
  {
    kind: "output",
    segments: [event, dash, { text: "Compiling /app/layout.tsx..." }],
    pauseAfter: 380,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Compiled successfully in 512ms" }],
    pauseAfter: 340,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Compiling /app/page.tsx..." }],
    pauseAfter: 360,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Compiled successfully in 288ms" }],
    pauseAfter: 420,
  },
  { kind: "blank", pauseAfter: 60 },
  {
    kind: "output",
    segments: [wait, dash, { text: "Watching /app for changes" }],
    pauseAfter: 260,
  },
  { kind: "output", segments: [tick, { text: "Ready in 1.1s" }], pauseAfter: 700 },
  { kind: "blank", pauseAfter: 120 },

  /* --- database ---------------------------------------------------------- */
  {
    kind: "command",
    segments: [prompt, { text: "npx prisma migrate status" }],
    pauseAfter: 380,
  },
  { kind: "blank", pauseAfter: 70 },
  {
    kind: "output",
    segments: [info, dash, { text: 'Datasource "db": PostgreSQL' }],
    pauseAfter: 340,
  },
  {
    kind: "output",
    segments: [info, dash, { text: "6 migrations found in prisma/migrations" }],
    pauseAfter: 520,
  },
  {
    kind: "output",
    segments: [tick, { text: "Database schema is up to date" }],
    pauseAfter: 640,
  },
  { kind: "blank", pauseAfter: 120 },

  /* --- types ------------------------------------------------------------- */
  { kind: "command", segments: [prompt, { text: "tsc --noEmit" }], pauseAfter: 360 },
  { kind: "blank", pauseAfter: 70 },
  {
    kind: "output",
    segments: [info, dash, { text: "Checking 214 files" }],
    pauseAfter: 900,
  },
  { kind: "output", segments: [tick, { text: "No type errors" }], pauseAfter: 720 },
  { kind: "blank", pauseAfter: 120 },

  /* --- lint -------------------------------------------------------------- */
  { kind: "command", segments: [prompt, { text: "npm run lint" }], pauseAfter: 360 },
  { kind: "blank", pauseAfter: 70 },
  {
    kind: "output",
    segments: [{ text: "> eslint . --max-warnings 0", tone: "muted" }],
    pauseAfter: 860,
  },
  { kind: "output", segments: [tick, { text: "0 problems" }], pauseAfter: 700 },
  { kind: "blank", pauseAfter: 120 },

  /* --- tests ------------------------------------------------------------- */
  { kind: "command", segments: [prompt, { text: "vitest run" }], pauseAfter: 360 },
  { kind: "blank", pauseAfter: 70 },
  {
    kind: "output",
    segments: [event, dash, { text: "Running 4 test files" }],
    pauseAfter: 520,
  },
  {
    kind: "output",
    segments: [tick, { text: "src/lib/format.test.ts " }, { text: "(6)", tone: "muted" }],
    pauseAfter: 300,
  },
  {
    kind: "output",
    segments: [tick, { text: "src/lib/cache.test.ts " }, { text: "(4)", tone: "muted" }],
    pauseAfter: 280,
  },
  {
    kind: "output",
    segments: [tick, { text: "src/api/routes.test.ts " }, { text: "(11)", tone: "muted" }],
    pauseAfter: 320,
  },
  {
    kind: "output",
    segments: [
      tick,
      { text: "src/hooks/use-query.test.ts " },
      { text: "(7)", tone: "muted" },
    ],
    pauseAfter: 420,
  },
  { kind: "blank", pauseAfter: 60 },
  {
    kind: "output",
    segments: [{ text: " Test Files  4 passed (4)", tone: "muted" }],
    pauseAfter: 140,
  },
  {
    kind: "output",
    segments: [{ text: "      Tests  28 passed (28)", tone: "muted" }],
    pauseAfter: 620,
  },
  { kind: "blank", pauseAfter: 120 },

  /* --- production build -------------------------------------------------- */
  { kind: "command", segments: [prompt, { text: "npm run build" }], pauseAfter: 380 },
  { kind: "blank", pauseAfter: 70 },
  {
    kind: "output",
    segments: [{ text: "> next build", tone: "muted" }],
    pauseAfter: 460,
  },
  { kind: "blank", pauseAfter: 60 },
  {
    kind: "output",
    segments: [info, dash, { text: "Creating an optimized production build" }],
    pauseAfter: 900,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Compiling client bundle" }],
    pauseAfter: 1100,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Compiling server bundle" }],
    pauseAfter: 950,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Generating static pages (24/24)" }],
    pauseAfter: 1000,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Optimizing images and fonts" }],
    pauseAfter: 780,
  },
  {
    kind: "output",
    segments: [event, dash, { text: "Collecting build traces" }],
    pauseAfter: 820,
  },
  { kind: "blank", pauseAfter: 60 },
  {
    kind: "output",
    segments: [tick, { text: "Build completed in 14.2s" }],
    pauseAfter: 800,
  },
  { kind: "blank", pauseAfter: 120 },

  { kind: "output", segments: [prompt] },
];

/** Rows kept on screen; older lines scroll off the top. */
export const TERMINAL_ROWS = 17;

export type CompiledStep = { step: Step; start: number; end: number };

export type TerminalFrame = {
  lines: Segment[][];
  /** Caret position on the last visible line, in characters. */
  caretRow: number;
  caretCol: number;
  finished: boolean;
};

function stepLength(step: Step): number {
  if (step.kind === "blank") return 0;
  return step.segments.reduce((total, s) => total + s.text.length, 0);
}

/**
 * Turns the script into absolute timings so any moment can be derived from a
 * single elapsed value — which is what lets reduced-motion jump straight to
 * the finished state, and what keeps playback correct if a frame is dropped.
 */
export function compileScript(steps: Step[] = terminalScript) {
  const compiled: CompiledStep[] = [];
  let cursor = 0;

  for (const step of steps) {
    const typing = step.kind === "command" ? stepLength(step) * CHAR_MS : 0;
    const start = cursor;
    const end = start + typing;
    compiled.push({ step, start, end });
    cursor = end + (step.pauseAfter ?? 0);
  }

  return { steps: compiled, duration: cursor };
}

function truncate(segments: Segment[], visible: number): Segment[] {
  const out: Segment[] = [];
  let budget = visible;

  for (const segment of segments) {
    if (budget <= 0) break;
    out.push(
      budget >= segment.text.length
        ? segment
        : { ...segment, text: segment.text.slice(0, budget) },
    );
    budget -= segment.text.length;
  }

  return out;
}

/** The visible state of the terminal at `elapsed` milliseconds. */
export function frameAt(
  compiled: ReturnType<typeof compileScript>,
  elapsed: number,
): TerminalFrame {
  const lines: Segment[][] = [];

  for (const { step, start, end } of compiled.steps) {
    if (elapsed < start) break;

    if (step.kind === "blank") {
      lines.push([]);
      continue;
    }

    if (step.kind === "output" || elapsed >= end) {
      lines.push(step.segments);
      continue;
    }

    const visible = Math.floor((elapsed - start) / CHAR_MS);
    lines.push(truncate(step.segments, visible));
  }

  const windowed = lines.slice(-TERMINAL_ROWS);
  const last = windowed[windowed.length - 1] ?? [];

  return {
    lines: windowed,
    caretRow: Math.max(0, windowed.length - 1),
    caretCol: last.reduce((total, s) => total + s.text.length, 0),
    finished: elapsed >= compiled.duration,
  };
}
