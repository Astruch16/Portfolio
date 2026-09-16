"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ActivityStrip } from "@/components/build-log/activity-strip";
import type { BuildLogEntry, BuildLogType } from "@/data/build-log";
import { TYPE_META } from "@/lib/build-log-types";
import { easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The log, as something to read through rather than scroll past.
 *
 * Every entry is collapsed to its date, kind and headline until it's opened, so
 * the whole log is legible at a glance and any one entry is one press away from
 * its detail. Search, kind and project narrow the set — all in the browser,
 * since the dataset is tiny — and the activity strip above jumps to a day.
 *
 * `/` puts the cursor in the search field from anywhere on the page, Escape
 * clears it. Entries are semantic `<article>`s with a real disclosure button,
 * so the keyboard and a screen reader get the same log the pointer does.
 */

const TYPE_ORDER: BuildLogType[] = [
  "ship",
  "build",
  "fix",
  "learn",
  "experiment",
  "decision",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDate = (date: string) => date.replaceAll("-", ".");
const monthKey = (date: string) => date.slice(0, 7);
const formatMonth = (key: string) => {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month) - 1]} / ${year}`;
};

/** Everything an entry says, for the search field to read. */
const haystack = (entry: BuildLogEntry) =>
  [
    entry.title,
    entry.summary,
    entry.project,
    entry.type,
    ...(entry.details ?? []),
    ...(entry.technologies ?? []),
  ]
    .join(" ")
    .toLowerCase();

/* --- Pieces ------------------------------------------------------------------ */

function CodeBlock({ code }: { code: NonNullable<BuildLogEntry["code"]> }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(code.content).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {},
    );
  };

  return (
    <div className="mt-6 max-w-[64ch] overflow-hidden rounded-sm border border-hairline-strong bg-void">
      <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
        <span className="label text-faint">{code.language ?? "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="label rounded-sm px-1.5 py-0.5 text-faint transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-[0.8125rem] leading-relaxed whitespace-pre text-muted">
          {code.content}
        </code>
      </pre>
    </div>
  );
}

function Entry({
  entry,
  open,
  onToggle,
}: {
  entry: BuildLogEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const meta = TYPE_META[entry.type];
  const panel = `${entry.id}-detail`;
  const detail = Boolean(
    entry.details?.length ||
    entry.code ||
    entry.technologies?.length ||
    entry.link,
  );

  return (
    <motion.article
      layout="position"
      id={entry.id}
      data-entry={entry.id}
      transition={{ duration: 0.35, ease: easing.outQuart }}
      className="relative scroll-mt-[calc(var(--nav-h)+5.5rem)] border-b border-hairline pl-8 sm:pl-12"
    >
      {/* The node on the spine, lit while the entry is open. */}
      <span
        aria-hidden
        className="absolute top-[1.65rem] left-0 grid size-4 place-items-center"
      >
        <span
          className="block rounded-full border-2 bg-bg transition-all duration-500"
          style={{
            borderColor: meta.color,
            width: open ? 13 : 10,
            height: open ? 13 : 10,
            backgroundColor: open ? meta.color : "transparent",
            boxShadow: open ? `0 0 0 5px ${meta.color}1f` : "none",
          }}
        />
      </span>

      <h3>
        <button
          type="button"
          aria-expanded={detail ? open : undefined}
          aria-controls={detail ? panel : undefined}
          onClick={onToggle}
          disabled={!detail}
          className="group/entry block w-full py-6 text-left"
        >
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <time
              className="label text-faint tabular-nums"
              dateTime={entry.date}
            >
              {formatDate(entry.date)}
            </time>
            <span
              className="label border px-1.5 py-0.5"
              style={{ color: meta.color, borderColor: `${meta.color}55` }}
            >
              {meta.badge}
            </span>
            {entry.project ? (
              <span className="label text-faint">{entry.project}</span>
            ) : null}
            {entry.featured ? (
              <span className="label text-accent">Featured</span>
            ) : null}
          </span>

          <span
            className={cn(
              "mt-3 block text-[clamp(1.3rem,2.4vw,1.9rem)] leading-[1.12] tracking-[-0.025em] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)]",
              open ? "text-fg" : "text-fg/90 group-hover/entry:translate-x-1.5",
            )}
          >
            {entry.title}
          </span>

          <span className="mt-3 flex items-start justify-between gap-6">
            <span className="max-w-[64ch] text-muted">{entry.summary}</span>
            {detail ? (
              <span className="label mt-1 flex shrink-0 items-center gap-2 text-faint transition-colors group-hover/entry:text-fg">
                <span className="hidden sm:inline">
                  {open ? "Close" : "Open"}
                </span>
                <span
                  aria-hidden
                  className="grid size-6 place-items-center rounded-full border border-hairline transition-transform duration-500 ease-[var(--ease-out-expo)]"
                  style={{ transform: open ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </span>
            ) : null}
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && detail ? (
          <motion.div
            id={panel}
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: easing.outQuart }}
            className="overflow-hidden"
          >
            <div className="pb-8">
              {entry.details?.length ? (
                <ul className="max-w-[64ch]">
                  {entry.details.map((item, i) => (
                    <li
                      key={item}
                      className="flex gap-4 border-t border-hairline py-3"
                    >
                      <span className="label shrink-0 text-faint tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.95rem] leading-relaxed text-muted">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {entry.code ? <CodeBlock code={entry.code} /> : null}

              {entry.technologies?.length || entry.link ? (
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {entry.technologies?.map((tech) => (
                    <span
                      key={tech}
                      className="label border border-hairline px-2 py-1 text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                  {entry.link ? (
                    <Link
                      href={entry.link}
                      className="group/link label inline-flex items-center gap-2 text-fg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                    >
                      {entry.link === "/" ? "View site" : "View it"}
                      <ArrowRight
                        aria-hidden
                        strokeWidth={1.5}
                        className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/link:translate-x-1"
                      />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function Chip({
  active,
  color,
  count,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "label inline-flex shrink-0 items-center gap-2 border px-3 py-2 transition-colors",
        active
          ? "border-hairline-strong bg-white/[0.05] text-fg"
          : "border-transparent text-faint hover:text-muted",
      )}
    >
      {color ? (
        <span
          aria-hidden
          className="block size-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {children}
      {count != null ? (
        <span className="tabular-nums opacity-60">
          {String(count).padStart(2, "0")}
        </span>
      ) : null}
    </button>
  );
}

/* --- The feed ------------------------------------------------------------------ */

export function BuildLogFeed({ entries }: { entries: BuildLogEntry[] }) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [entries],
  );

  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<"all" | BuildLogType>("all");
  const [activeProject, setActiveProject] = useState<"all" | string>("all");
  const [open, setOpen] = useState<string | null>(
    () => sorted.find((entry) => entry.featured)?.id ?? sorted[0]?.id ?? null,
  );
  const search = useRef<HTMLInputElement>(null);

  const presentTypes = useMemo(
    () =>
      TYPE_ORDER.filter((type) => sorted.some((entry) => entry.type === type)),
    [sorted],
  );
  const presentProjects = useMemo(() => {
    const seen: string[] = [];
    for (const entry of sorted)
      if (entry.project && !seen.includes(entry.project))
        seen.push(entry.project);
    return seen;
  }, [sorted]);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      sorted.filter(
        (entry) =>
          (activeType === "all" || entry.type === activeType) &&
          (activeProject === "all" || entry.project === activeProject) &&
          (!needle || haystack(entry).includes(needle)),
      ),
    [sorted, activeType, activeProject, needle],
  );

  const groups = useMemo(() => {
    const map = new Map<string, BuildLogEntry[]>();
    for (const entry of filtered) {
      const key = monthKey(entry.date);
      const list = map.get(key);
      if (list) list.push(entry);
      else map.set(key, [entry]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  // A day pressed on the strip: clear whatever is hiding it, open it, and take
  // the reader there.
  const jump = useCallback((id: string) => {
    setActiveType("all");
    setActiveProject("all");
    setQuery("");
    setOpen(id);
    requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      event.preventDefault();
      search.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <ActivityStrip entries={sorted} onSelect={jump} />

      {/* --- Controls ------------------------------------------------------- */}
      <div className="sticky top-[var(--nav-h)] z-30 mt-8 -mx-[var(--gutter)] border-y border-hairline bg-bg/85 px-(--gutter) backdrop-blur-md">
        <div className="flex flex-col gap-2 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div
            role="group"
            aria-label="Filter by kind"
            className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Chip
              active={activeType === "all"}
              count={sorted.length}
              onClick={() => setActiveType("all")}
            >
              All
            </Chip>
            {presentTypes.map((type) => (
              <Chip
                key={type}
                active={activeType === type}
                color={TYPE_META[type].color}
                count={sorted.filter((entry) => entry.type === type).length}
                onClick={() => setActiveType(type)}
              >
                {TYPE_META[type].filter}
              </Chip>
            ))}
          </div>

          <label className="group/search flex shrink-0 items-center gap-2.5 border-b border-hairline-strong py-1.5 transition-colors focus-within:border-accent lg:w-[18rem]">
            <Search
              aria-hidden
              strokeWidth={1.5}
              className="size-3.5 shrink-0 text-faint"
            />
            <span className="sr-only">Search the log</span>
            <input
              ref={search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
              }}
              placeholder="Search the log"
              spellCheck={false}
              className="w-full min-w-0 bg-transparent font-mono text-[0.8125rem] text-fg caret-accent outline-none placeholder:text-faint"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  search.current?.focus();
                }}
                className="shrink-0 text-faint transition-colors hover:text-fg"
              >
                <X aria-hidden strokeWidth={1.5} className="size-3.5" />
                <span className="sr-only">Clear search</span>
              </button>
            ) : (
              <kbd
                aria-hidden
                className="hidden shrink-0 border border-hairline-strong px-1.5 py-px font-mono text-[0.625rem] text-faint group-focus-within/search:opacity-0 [@media(hover:hover)]:inline"
              >
                /
              </kbd>
            )}
          </label>
        </div>

        {presentProjects.length > 1 ? (
          <div
            role="group"
            aria-label="Filter by project"
            className="flex gap-1 overflow-x-auto border-t border-hairline py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Chip
              active={activeProject === "all"}
              onClick={() => setActiveProject("all")}
            >
              All projects
            </Chip>
            {presentProjects.map((project) => (
              <Chip
                key={project}
                active={activeProject === project}
                count={
                  sorted.filter((entry) => entry.project === project).length
                }
                onClick={() => setActiveProject(project)}
              >
                {project}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      {/* --- Entries ---------------------------------------------------------- */}
      <p className="label mt-6 text-faint" aria-live="polite">
        <span className="text-fg tabular-nums">
          {String(filtered.length).padStart(2, "0")}
        </span>{" "}
        of {String(sorted.length).padStart(2, "0")} entries
      </p>

      {groups.length ? (
        <div className="mt-6">
          {groups.map(([key, items]) => (
            <section
              key={key}
              aria-label={formatMonth(key)}
              className="relative"
            >
              <h2 className="label sticky top-[calc(var(--nav-h)+4.25rem)] z-20 -mx-[var(--gutter)] bg-bg/85 px-(--gutter) py-2 text-faint backdrop-blur-md">
                {formatMonth(key)}
                <span className="text-faint/60"> · </span>
                {items.length}
              </h2>
              <div className="relative">
                {/* The spine the nodes sit on. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-[7px] w-px bg-hairline"
                />
                {items.map((entry) => (
                  <Entry
                    key={entry.id}
                    entry={entry}
                    open={open === entry.id}
                    onToggle={() =>
                      setOpen((current) =>
                        current === entry.id ? null : entry.id,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="label mt-12 text-faint">Nothing under this filter yet.</p>
      )}
    </div>
  );
}
