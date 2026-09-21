"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { stackCategories, type SnippetTone } from "@/data/stack";
import {
  terminalSession,
  type Segment,
  type TerminalTab,
  type Tone,
} from "@/lib/terminal-session";
import { cn } from "@/lib/utils";

/**
 * The hero's terminal: the stack and the prompt in one window.
 *
 * It used to be two loose strips — category labels that opened popovers, and a
 * prompt whose answers printed over the sculpture — with nothing between them
 * and the statement. Now it's a window that fills that space: a tab per stack
 * category and one for the session, a body, and the prompt with its quick
 * commands along the bottom. Commands answer in the session tab, and
 * `frontend`, `backend`, `infra` or `stack <name>` switch tabs from the prompt.
 *
 * The body takes whatever height the hero leaves it, which runs from a single
 * line on a short laptop screen to a dozen on a tall monitor, so it never
 * clips a row in half. It counts the rows that fit and lays the tab out for
 * that many: every entry with its snippet when there's room, as many as fit
 * and a count of the rest when there's less, and a single line of names when
 * there's hardly any. On a screen too short for even one row, the body opens
 * as a panel under the window while the visitor is using it instead.
 *
 * A real input, so it works with a keyboard, a screen reader and a phone's
 * on-screen keyboard; `/` focuses it from anywhere on the page. The tabs are a
 * proper tablist, arrow keys included.
 */

const QUICK = ["help", "work", "ship", "about", "contact"] as const;
const NAVIGATE_AFTER_MS = 700;
/** Px per body row. Fixed, so the number that fit can be counted. */
const ROW_PX = 18;
/** Px of padding above and below the rows. */
const BODY_PAD = 4;
/** Rows in the panel that opens when the hero has no room for a body. */
const PANEL_ROWS = 7;
/** Below this many rows a listing collapses to a line of names. */
const LIST_MIN_ROWS = 3;

const SESSION_TONE: Record<Tone, string> = {
  text: "text-fg",
  muted: "text-faint",
  accent: "text-accent",
  success: "text-[#5f8a12]",
  prompt: "text-accent",
};

const SNIPPET_TONE: Record<SnippetTone, string> = {
  plain: "text-muted",
  keyword: "text-accent",
  muted: "text-faint",
  success: "text-[#5f8a12]",
};

const TABS: { id: TerminalTab; label: string }[] = [
  ...stackCategories.map((c) => ({ id: c.id, label: c.short ?? c.id })),
  { id: "session", label: "session" },
];

const INTRO: Segment[][] = [
  [
    { text: "interactive session — type ", tone: "muted" },
    { text: "help", tone: "accent" },
  ],
];

/** One row of a category listing. */
type ListRow = {
  name?: string;
  /** The entry's position in its category, on its first line only. */
  number?: number;
  tokens: { text: string; tone?: SnippetTone }[];
};

function StackListing({ id, rows }: { id: string; rows: number }) {
  const category = stackCategories.find((c) => c.id === id)!;

  if (rows < LIST_MIN_ROWS) {
    return (
      <p
        className="term-line overflow-hidden text-muted"
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: rows,
        }}
      >
        {category.entries.map((entry, i) => (
          <span key={entry.name}>
            {i ? <span className="text-faint"> · </span> : null}
            <span className="text-fg">{entry.name}</span>
          </span>
        ))}
      </p>
    );
  }

  const tokens = (row: ListRow["tokens"]) =>
    row.map((token, j) => (
      <span key={j} className={SNIPPET_TONE[token.tone ?? "plain"]}>
        {token.text}
      </span>
    ));

  // With room to spare, each technology gets its own heading line with its
  // snippet under it — spaced apart when there's more room still — rather than
  // a short table stranded at the top of a tall window.
  const lines = category.entries.reduce((sum, e) => sum + e.lines.length, 0);
  const count = category.entries.length;
  const stacked = rows >= lines + count;
  const spaced = rows >= lines + count * 2 - 1;

  if (stacked) {
    let i = 0;
    return (
      <>
        {category.entries.map((entry, e) => (
          <div key={entry.name} className={cn(spaced && e > 0 && "pt-[18px]")}>
            <p
              className="term-line flex text-[0.625rem] tracking-[0.1em] uppercase"
              style={{ animationDelay: `${i++ * 30}ms` }}
            >
              <span className="w-9 shrink-0 text-faint">
                {String(e + 1).padStart(2, "0")}
              </span>
              <span className="text-fg">{entry.name}</span>
            </p>
            {entry.lines.map((row, r) => (
              <p
                key={r}
                className="term-line truncate pl-9 whitespace-pre"
                style={{ animationDelay: `${i++ * 30}ms` }}
              >
                {tokens(row)}
              </p>
            ))}
          </div>
        ))}
      </>
    );
  }

  const all: ListRow[] = category.entries.flatMap((entry, e) =>
    entry.lines.map((row, i) => ({
      name: i === 0 ? entry.name : undefined,
      number: i === 0 ? e + 1 : undefined,
      tokens: row,
    })),
  );

  // Whole entries only: never an entry's first line without the rest of it.
  let shown = all;
  let hidden = 0;
  if (all.length > rows) {
    shown = [];
    let used = 0;
    for (const [e, entry] of category.entries.entries()) {
      if (used + entry.lines.length > rows - 1) break;
      entry.lines.forEach((row, i) =>
        shown.push({
          name: i === 0 ? entry.name : undefined,
          number: i === 0 ? e + 1 : undefined,
          tokens: row,
        }),
      );
      used += entry.lines.length;
    }
    hidden = count - shown.filter((row) => row.name).length;
  }

  return (
    <>
      {shown.map((row, i) => (
        <p
          key={i}
          className="term-line flex whitespace-pre"
          style={{ animationDelay: `${i * 35}ms` }}
        >
          {/* Numbered like the roomier layout, so a tab reads the same
              whichever one the height allows. */}
          <span className="w-9 shrink-0 text-[0.625rem] tracking-[0.1em] text-faint tabular-nums">
            {row.number ? String(row.number).padStart(2, "0") : ""}
          </span>
          <span className="w-[15ch] shrink-0 truncate text-[0.625rem] tracking-[0.1em] text-fg uppercase sm:w-[18ch]">
            {row.name ?? ""}
          </span>
          <span className="truncate">{tokens(row.tokens)}</span>
        </p>
      ))}
      {hidden ? (
        <p
          className="term-line text-faint"
          style={{ animationDelay: `${shown.length * 35}ms` }}
        >
          + {hidden} more ·{" "}
          <span className="text-accent">
            stack {category.short ?? category.id}
          </span>
        </p>
      ) : null}
    </>
  );
}

function SessionLog({ history, rows }: { history: Segment[][]; rows: number }) {
  const source = history.length ? history : INTRO;
  // Every answer ends on a blank separator; the newest one needn't show.
  const lines = source.at(-1)?.length === 0 ? source.slice(0, -1) : source;
  return (
    <>
      {lines.slice(-rows).map((line, i) => (
        <p key={`${lines.length}-${i}`} className="truncate whitespace-pre">
          {line.length
            ? line.map((segment, j) => (
                <span key={j} className={SESSION_TONE[segment.tone ?? "text"]}>
                  {segment.text}
                </span>
              ))
            : " "}
        </p>
      ))}
    </>
  );
}

export function HeroTerminal({ className }: { className?: string }) {
  const session = useSyncExternalStore(
    terminalSession.subscribe,
    terminalSession.getSnapshot,
    terminalSession.getServerSnapshot,
  );
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const router = useRouter();
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(4);
  // Only matters when there's no room for a body: whether the visitor is using
  // the terminal, so its panel should be open.
  const [engaged, setEngaged] = useState(false);

  // Focus requests can come from outside the prompt.
  useEffect(() => {
    if (session.focusTick > 0) input.current?.focus({ preventScroll: true });
  }, [session.focusTick]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      event.preventDefault();
      input.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(pending.current);
    };
  }, []);

  useEffect(() => {
    if (!engaged) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setEngaged(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [engaged]);

  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const height = el.clientHeight;
      // A single row can borrow the padding; more than one needs it.
      setRows(
        height >= ROW_PX + BODY_PAD * 2
          ? Math.floor((height - BODY_PAD * 2) / ROW_PX)
          : height >= ROW_PX
            ? 1
            : 0,
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const run = () => {
    const route = terminalSession.run();
    if (route) {
      clearTimeout(pending.current);
      pending.current = setTimeout(() => router.push(route), NAVIGATE_AFTER_MS);
    }
  };

  const select = (index: number) => {
    const tab = TABS[(index + TABS.length) % TABS.length];
    terminalSession.setTab(tab.id);
    tabs.current[tab.id]?.focus();
  };

  const current = TABS.findIndex((t) => t.id === session.tab);
  const category = stackCategories.find((c) => c.id === session.tab);

  const compact = rows === 0;
  // Rows the current tab would take to show in full.
  const needed = category
    ? category.entries.reduce((sum, entry) => sum + entry.lines.length, 0)
    : Math.max(
        1,
        session.history.filter(
          (line, i, all) => i < all.length - 1 || line.length,
        ).length,
      );
  // When the body can't show all of it, the full version opens as a panel
  // under the window for as long as the visitor is using the terminal.
  const cramped = rows < Math.min(needed, PANEL_ROWS);
  const content = (count: number) => (
    <div key={session.tab}>
      {category ? (
        <StackListing id={category.id} rows={count} />
      ) : (
        <SessionLog history={session.history} rows={count} />
      )}
    </div>
  );

  return (
    <div
      ref={root}
      className={cn(
        "relative flex flex-col font-mono text-[0.6875rem]",
        className,
      )}
      onPointerDown={() => setEngaged(true)}
      onFocus={() => setEngaged(true)}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node | null))
          setEngaged(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setEngaged(false);
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-hairline-strong bg-bg/85 shadow-[0_28px_60px_-40px_rgb(24_16_60/0.45)] backdrop-blur-[2px]">
        {/* --- Title bar: the tabs, and where the current one points ------------ */}
        <div className="flex shrink-0 items-stretch gap-3 border-b border-hairline pr-3 pl-3">
          <span aria-hidden className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block size-[5px] rounded-full bg-hairline-strong"
              />
            ))}
          </span>
          <div
            role="tablist"
            aria-label="Terminal"
            className="flex items-stretch"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") select(current + 1);
              else if (event.key === "ArrowLeft") select(current - 1);
              else if (event.key === "Home") select(0);
              else if (event.key === "End") select(TABS.length - 1);
              else return;
              event.preventDefault();
            }}
          >
            {TABS.map((tab) => {
              const on = tab.id === session.tab;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabs.current[tab.id] = el;
                  }}
                  id={`hero-terminal-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="hero-terminal-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => terminalSession.setTab(tab.id)}
                  className={cn(
                    "relative px-2 py-[0.375rem] text-[0.625rem] tracking-[0.14em] uppercase transition-colors",
                    on ? "text-fg" : "text-faint hover:text-muted",
                  )}
                >
                  {tab.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2 -bottom-px block h-px origin-left bg-accent transition-transform duration-300 ease-[var(--ease-out-expo)]",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              );
            })}
          </div>
          <span
            aria-hidden
            className="ml-auto hidden min-w-0 items-center gap-2 text-[0.625rem] tracking-[0.08em] text-faint sm:flex"
          >
            <span className="truncate">
              {category ? category.path : "tty · live"}
            </span>
            <span className="shrink-0">
              {category ? category.entries.length : ""}
            </span>
            <span className="block size-1.5 shrink-0 rounded-full bg-signal" />
          </span>
        </div>

        {/* --- Body ------------------------------------------------------------ */}
        <div
          ref={body}
          id={compact ? undefined : "hero-terminal-panel"}
          role={compact ? undefined : "tabpanel"}
          aria-labelledby={
            compact ? undefined : `hero-terminal-tab-${session.tab}`
          }
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden px-3 leading-[18px]",
            // A lone line of names sits in the middle of whatever room it has.
            rows > 0 &&
              (rows === 1 || (rows < LIST_MIN_ROWS && category)) &&
              "flex items-center",
          )}
          style={{ paddingBlock: compact ? 0 : BODY_PAD }}
        >
          {compact ? null : content(rows)}
        </div>

        {/* --- Prompt ------------------------------------------------------------ */}
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline px-3 py-[0.3125rem]">
          <label className="group/prompt flex min-w-[12ch] flex-1 items-center gap-2">
            <span aria-hidden className="text-[0.8125rem] text-accent">
              &gt;
            </span>
            <span className="sr-only">Terminal command</span>
            <input
              ref={input}
              value={session.input}
              onFocus={() => terminalSession.activate()}
              onChange={(event) => terminalSession.setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  run();
                } else if (event.key === "Escape") {
                  input.current?.blur();
                }
              }}
              placeholder="type a command"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              enterKeyHint="go"
              className="w-full min-w-0 bg-transparent text-[0.8125rem] tracking-[0.04em] text-fg caret-accent outline-none placeholder:text-faint"
            />
            <kbd
              aria-hidden
              className="hidden border border-hairline-strong px-1.5 py-px text-[0.625rem] leading-none text-faint transition-opacity group-focus-within/prompt:opacity-0 [@media(hover:hover)]:inline"
            >
              /
            </kbd>
          </label>

          <div className="flex flex-wrap gap-1">
            {QUICK.map((command) => (
              <button
                key={command}
                type="button"
                onClick={() => {
                  terminalSession.setInput(command);
                  run();
                }}
                className="border border-hairline px-1.5 py-0.5 text-[0.625rem] tracking-[0.06em] text-muted transition-colors hover:border-accent hover:text-fg"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- The body in full, as a panel, when the hero has too little room ----- */}
      {cramped ? (
        <div
          // Stands in for the body entirely when there's no body to speak of;
          // otherwise a sighted convenience over the body that's already there.
          id={compact ? "hero-terminal-panel" : undefined}
          role={compact ? "tabpanel" : undefined}
          aria-labelledby={
            compact ? `hero-terminal-tab-${session.tab}` : undefined
          }
          aria-hidden={compact ? undefined : true}
          hidden={!engaged}
          className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-[6px] border border-hairline-strong bg-bg px-3 leading-[18px] shadow-[0_18px_44px_-14px_rgb(10_8_20/0.35)]"
          style={{ paddingBlock: BODY_PAD * 2 }}
        >
          {engaged ? content(PANEL_ROWS) : null}
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {session.announcement}
      </p>
    </div>
  );
}
