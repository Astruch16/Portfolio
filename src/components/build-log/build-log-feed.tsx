"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { MaskReveal } from "@/components/motion/reveal";
import type { BuildLogEntry, BuildLogType } from "@/data/build-log";
import { cn } from "@/lib/utils";

/**
 * The filterable log. A small client island: the dataset is tiny, so type and
 * project filtering happen in the browser. Entries are semantic <article>s on a
 * static activity line (drawing it per-filter would re-animate on every click);
 * headings mask in once, which keeps the page calm. Reduced motion is handled by
 * the shared <MotionProvider reducedMotion="user">.
 */

const TYPE_META: Record<BuildLogType, { badge: string; filter: string; color: string }> = {
  ship: { badge: "Ship", filter: "Shipped", color: "#b6e53b" },
  build: { badge: "Build", filter: "Build", color: "#7257ff" },
  fix: { badge: "Fix", filter: "Fix", color: "#f5b74a" },
  learn: { badge: "Learn", filter: "Learn", color: "#22d3ee" },
  experiment: { badge: "Experiment", filter: "Experiment", color: "#8b5cf6" },
  decision: { badge: "Decision", filter: "Decision", color: "#e6e6ea" },
};

const TYPE_ORDER: BuildLogType[] = [
  "ship",
  "build",
  "fix",
  "learn",
  "experiment",
  "decision",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatDate = (date: string) => date.replaceAll("-", ".");
const monthKey = (date: string) => date.slice(0, 7);
const formatMonth = (key: string) => {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month) - 1]} / ${year}`;
};

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
    <div className="mt-5 max-w-[64ch] overflow-hidden rounded-sm border border-hairline-strong bg-void">
      <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
        <span className="label text-faint">{code.language ?? "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="label rounded-sm px-1.5 py-0.5 text-faint transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

function EntryMeta({ entry }: { entry: BuildLogEntry }) {
  const meta = TYPE_META[entry.type];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <time className="label text-faint tabular-nums" dateTime={entry.date}>
        {formatDate(entry.date)}
      </time>
      <span className="label" style={{ color: meta.color }}>
        {meta.badge}
        {entry.project ? (
          <>
            <span className="text-faint"> / </span>
            {entry.project}
          </>
        ) : null}
      </span>
      {entry.status ? (
        <span className="label text-faint">· {entry.status}</span>
      ) : null}
    </div>
  );
}

function EntryTech({ entry }: { entry: BuildLogEntry }) {
  if (!entry.technologies?.length && !entry.link) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
      {entry.technologies?.length ? (
        <div className="flex flex-wrap gap-2">
          {entry.technologies.map((tech) => (
            <span
              key={tech}
              className="label rounded-sm border border-hairline px-2 py-1 text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      ) : null}
      {entry.link ? (
        <Link
          href={entry.link}
          className="group/link label inline-flex items-center gap-2 text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {entry.link === "/" ? "View site" : "View project"}
          <ArrowRight
            aria-hidden
            strokeWidth={1.5}
            className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/link:translate-x-1"
          />
        </Link>
      ) : null}
    </div>
  );
}

function DetailList({ items, columns }: { items: string[]; columns?: boolean }) {
  const color = "var(--color-muted)";
  return (
    <ul
      className={cn(
        "mt-4 max-w-[64ch] gap-x-8",
        columns ? "grid sm:grid-cols-2" : "flex flex-col",
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex gap-3 py-1 text-muted">
          <span aria-hidden className="mt-2 block size-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[0.95rem] leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FeaturedEntry({ entry }: { entry: BuildLogEntry }) {
  const meta = TYPE_META[entry.type];
  return (
    <article className="relative border border-hairline-strong p-6 sm:p-9">
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-2 -inset-y-4 -z-10 opacity-50 blur-2xl"
        style={{ background: `radial-gradient(ellipse at center, ${meta.color}1f 0%, transparent 70%)` }}
      />
      <p className="label">
        <span style={{ color: meta.color }}>Featured</span>
        <span className="text-faint"> / </span>
        <time className="tabular-nums" dateTime={entry.date}>
          {formatDate(entry.date)}
        </time>
        <span className="text-faint"> · </span>
        {meta.badge}
        {entry.project ? ` / ${entry.project}` : ""}
      </p>
      <h3 className="display mt-4 text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.02] text-fg">
        <MaskReveal onView>{entry.title}</MaskReveal>
      </h3>
      <p className="mt-4 max-w-[60ch] text-lead text-muted">{entry.summary}</p>
      {entry.details?.length ? <DetailList items={entry.details} columns /> : null}
      {entry.code ? <CodeBlock code={entry.code} /> : null}
      <EntryTech entry={entry} />
    </article>
  );
}

function LogEntry({ entry }: { entry: BuildLogEntry }) {
  const meta = TYPE_META[entry.type];
  return (
    <article className="relative pl-8 sm:pl-10">
      {/* node on the activity line */}
      <span aria-hidden className="absolute left-0 top-1 grid size-4 place-items-center">
        <span
          className="size-[13px] rounded-full border-2 bg-bg"
          style={{ borderColor: meta.color }}
        />
      </span>
      <EntryMeta entry={entry} />
      <h3 className="display mt-3 text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.08] text-fg">
        <MaskReveal onView>{entry.title}</MaskReveal>
      </h3>
      <p className="mt-3 max-w-[64ch] text-lead text-muted">{entry.summary}</p>
      {entry.details?.length ? <DetailList items={entry.details} /> : null}
      {entry.code ? <CodeBlock code={entry.code} /> : null}
      <EntryTech entry={entry} />
    </article>
  );
}

export function BuildLogFeed({ entries }: { entries: BuildLogEntry[] }) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [entries],
  );

  const presentTypes = useMemo(
    () => TYPE_ORDER.filter((t) => sorted.some((e) => e.type === t)),
    [sorted],
  );
  const presentProjects = useMemo(() => {
    const seen: string[] = [];
    for (const e of sorted) if (e.project && !seen.includes(e.project)) seen.push(e.project);
    return seen;
  }, [sorted]);

  const [activeType, setActiveType] = useState<"all" | BuildLogType>("all");
  const [activeProject, setActiveProject] = useState<"all" | string>("all");

  const filtered = useMemo(
    () =>
      sorted.filter(
        (e) =>
          (activeType === "all" || e.type === activeType) &&
          (activeProject === "all" || e.project === activeProject),
      ),
    [sorted, activeType, activeProject],
  );

  const featured = filtered.find((e) => e.featured);
  const rest = filtered.filter((e) => !e.featured);

  const groups = useMemo(() => {
    const map = new Map<string, BuildLogEntry[]>();
    for (const e of rest) {
      const key = monthKey(e.date);
      const arr = map.get(key);
      if (arr) arr.push(e);
      else map.set(key, [e]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [rest]);

  return (
    <div>
      {/* --- Filters ----------------------------------------------------- */}
      <div className="flex flex-col gap-3">
        <div
          role="group"
          aria-label="Filter by type"
          className="flex gap-x-2 gap-y-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <FilterButton
            active={activeType === "all"}
            onClick={() => setActiveType("all")}
          >
            All
          </FilterButton>
          {presentTypes.map((t) => (
            <FilterButton
              key={t}
              active={activeType === t}
              color={TYPE_META[t].color}
              onClick={() => setActiveType(t)}
            >
              {TYPE_META[t].filter}
            </FilterButton>
          ))}
        </div>

        {presentProjects.length > 1 ? (
          <div
            role="group"
            aria-label="Filter by project"
            className="flex gap-x-2 gap-y-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FilterButton
              active={activeProject === "all"}
              onClick={() => setActiveProject("all")}
              subtle
            >
              All projects
            </FilterButton>
            {presentProjects.map((p) => (
              <FilterButton
                key={p}
                active={activeProject === p}
                onClick={() => setActiveProject(p)}
                subtle
              >
                {p}
              </FilterButton>
            ))}
          </div>
        ) : null}
      </div>

      {/* --- Featured ---------------------------------------------------- */}
      {featured ? (
        <div className="mt-10">
          <FeaturedEntry entry={featured} />
        </div>
      ) : null}

      {/* --- Grouped feed on the activity line --------------------------- */}
      {groups.length ? (
        <div className="mt-14 flex flex-col gap-14">
          {groups.map(([key, items]) => (
            <section key={key} aria-label={formatMonth(key)}>
              <h2 className="label text-faint">{formatMonth(key)}</h2>
              <div className="relative mt-6">
                {/* activity line */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-2 left-[7px] top-2 hidden w-px bg-hairline sm:block"
                />
                <div className="flex flex-col gap-12">
                  {items.map((entry) => (
                    <LogEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-14 label text-faint">Nothing under this filter yet.</p>
      )}
    </div>
  );
}

function FilterButton({
  active,
  color,
  subtle,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  subtle?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "label shrink-0 whitespace-nowrap rounded-sm border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-hairline-strong text-fg"
          : "border-hairline text-faint hover:text-muted",
        subtle && "px-2.5 py-1",
      )}
      style={active && color ? { color, borderColor: color } : undefined}
    >
      {children}
    </button>
  );
}
