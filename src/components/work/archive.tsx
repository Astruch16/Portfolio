"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight, LayoutGrid, Rows3 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { COMPOSITIONS } from "@/components/work/visuals";
import type { Project } from "@/data/projects";
import type { CaseImage } from "@/lib/case-image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { easing } from "@/lib/motion";
import { stackGroups } from "@/lib/stack-groups";
import { cn } from "@/lib/utils";
import { wordmarkProps } from "@/lib/wordmark";

/**
 * The archive: every project, in two views, with the set narrowed on demand.
 *
 * The page used to be five fixed blocks scrolled past in one order. It is now
 * something to use: filters cut the set down (counted from the data, never
 * written), and the same projects are read either as an index — a line each,
 * type-led, with the screenshot riding the cursor — or as plates, where the
 * screenshots carry it and the type annotates.
 *
 * The cursor preview is for pointers only: it never appears for a touch or a
 * keyboard, where the index instead lights the focused row. Everything else
 * works identically in both views, and both are the same links to the same
 * case studies.
 */

export type ArchiveItem = {
  project: Project;
  /** The case study's hero shot, where there is one. */
  shot?: CaseImage;
};

type Filter = { id: string; label: string; match: (p: Project) => boolean };

const FILTERS: Filter[] = [
  { id: "all", label: "Everything", match: () => true },
  { id: "product", label: "Products", match: (p) => p.kind === "Product" },
  { id: "client", label: "Client work", match: (p) => p.kind === "Client" },
  {
    id: "beta",
    label: "In closed beta",
    match: (p) => p.status === "Closed beta",
  },
];

const VIEWS = [
  { id: "index", label: "Index", Icon: Rows3 },
  { id: "plates", label: "Plates", Icon: LayoutGrid },
] as const;

type View = (typeof VIEWS)[number]["id"];

/* --- Shared pieces ----------------------------------------------------------- */

function Corners({ color }: { color: string }) {
  return (
    <>
      {[
        "-top-px -left-px border-t border-l",
        "-top-px -right-px border-t border-r",
        "-bottom-px -left-px border-b border-l",
        "-right-px -bottom-px border-r border-b",
      ].map((edge) => (
        <span
          key={edge}
          aria-hidden
          className={cn("absolute z-10 block size-3", edge)}
          style={{ borderColor: color }}
        />
      ))}
    </>
  );
}

function Shot({
  item,
  sizes,
  priority,
  className,
}: {
  item: ArchiveItem;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const { project, shot } = item;
  const Composition = COMPOSITIONS[project.visual];

  if (!shot) {
    return (
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden bg-void",
          className,
        )}
      >
        <Composition accent={project.accent} />
        <span className="label absolute bottom-3 left-4 text-faint">
          Visual / placeholder
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden bg-void", className)}
      style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
    >
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover object-top"
      />
    </div>
  );
}

/* --- The cursor preview ------------------------------------------------------- */

function CursorPreview({ item }: { item: ArchiveItem | null }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 260, damping: 28, mass: 0.6 };
  const left = useSpring(x, spring);
  const top = useSpring(y, spring);
  // Leans in the direction it's travelling, like a held card.
  const tilt = useTransform(left, (value) => (value - x.get()) * 0.06);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 hidden w-[26rem] -translate-x-1/2 -translate-y-1/2 lg:block"
      style={{ x: left, y: top, rotate: tilt }}
    >
      <AnimatePresence>
        {item ? (
          <motion.div
            key={item.project.slug}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: easing.outQuart }}
            className="relative border border-hairline-strong shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)]"
          >
            <span
              aria-hidden
              className="absolute -inset-6 -z-10 blur-2xl"
              style={{
                background: `radial-gradient(ellipse at center, ${item.project.accent}55, transparent 70%)`,
              }}
            />
            <Shot item={item} sizes="26rem" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

/* --- Index view ---------------------------------------------------------------- */

function IndexRow({
  item,
  dimmed,
  onEnter,
  onLeave,
  onFocus,
  onBlur,
}: {
  item: ArchiveItem;
  dimmed: boolean;
  /** Pointer only: the preview rides the cursor, so it needs one. */
  onEnter: () => void;
  onLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const { project } = item;
  const wordmark = wordmarkProps(project);
  const stack = stackGroups(project);
  const count = stack.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: easing.outQuart }}
      className="border-b border-hairline"
    >
      <Link
        href={`/work/${project.slug}`}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") onEnter();
        }}
        onPointerLeave={onLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          "group/row relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-5 gap-y-3 py-[clamp(1.5rem,3.5vh,2.5rem)] transition-opacity duration-500 lg:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1fr)_auto]",
          dimmed ? "opacity-35" : "opacity-100",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-[-1.25rem] w-[calc(100%+2.5rem)] origin-left scale-x-0 bg-white/[0.03] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100"
        />
        <span className="label relative" style={{ color: project.accent }}>
          {project.index}
        </span>

        <span className="relative min-w-0">
          <span
            className={cn(
              "display block truncate text-[clamp(1.75rem,3.4vw,3rem)] leading-[0.95] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/row:translate-x-2",
              wordmark?.className,
            )}
            style={wordmark?.style}
          >
            {project.name}
          </span>
          <span className="label mt-2.5 block truncate text-faint lg:hidden">
            {project.discipline}
          </span>
        </span>

        <span className="relative hidden min-w-0 lg:block">
          <span className="label block truncate text-muted">
            {project.discipline}
          </span>
          <span className="label mt-2 block text-faint">
            {count ? `${count} technologies` : "[ stack pending ]"}
          </span>
        </span>

        <span className="relative col-start-2 flex items-center gap-4 lg:col-start-4 lg:justify-self-end">
          <span className="label text-faint">
            {project.status ?? project.kind}
          </span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-hairline transition-colors duration-300 group-hover/row:border-accent">
            <ArrowUpRight
              aria-hidden
              strokeWidth={1.5}
              className="size-4 text-muted transition-all duration-300 ease-[var(--ease-out-expo)] group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-fg"
            />
          </span>
        </span>
      </Link>
    </motion.li>
  );
}

/* --- Plates view ---------------------------------------------------------------- */

function Plate({ item, index }: { item: ArchiveItem; index: number }) {
  const { project } = item;
  const wordmark = wordmarkProps(project);
  // A staggered pair of columns: every other plate drops, so the grid reads as
  // a contact sheet rather than a table.
  const offset = index % 2 === 1;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: easing.outQuart }}
      className={cn("min-w-0", offset && "lg:mt-[clamp(2rem,7vh,5rem)]")}
    >
      <Link href={`/work/${project.slug}`} className="group/plate block">
        <div className="relative isolate">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-[6%] -inset-y-[10%] -z-10 opacity-40 blur-2xl transition-opacity duration-500 group-hover/plate:opacity-90"
            style={{
              background: `radial-gradient(ellipse at center, ${project.accent}33, transparent 70%)`,
            }}
          />
          <Corners color={project.accent} />
          <div className="relative overflow-hidden border border-hairline-strong">
            <div className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover/plate:scale-[1.03]">
              <Shot
                item={item}
                sizes="(min-width: 1024px) 46vw, 92vw"
                priority={index < 2}
              />
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/plate:opacity-100"
              style={{
                background: `linear-gradient(to top, ${project.accent}26, transparent 55%)`,
              }}
            />
            <span className="label absolute right-4 bottom-4 flex items-center gap-2 text-fg opacity-0 transition-opacity duration-300 group-hover/plate:opacity-100">
              Open case study
              <ArrowUpRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5"
              />
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <p className="label text-muted">
            <span style={{ color: project.accent }}>{project.index}</span>
            <span className="text-faint"> / </span>
            {project.kind}
          </p>
          <p className="label text-faint">
            {project.status ?? "[ status pending ]"}
          </p>
        </div>

        <h2
          className={cn(
            "display mt-3 text-[clamp(1.75rem,3vw,2.75rem)] leading-[0.95] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/plate:translate-x-1.5",
            wordmark?.className,
          )}
          style={wordmark?.style}
        >
          {project.name}
        </h2>
        <p className="label mt-3 text-faint">{project.discipline}</p>
        {project.statement ? (
          <p className="mt-4 max-w-[46ch] text-muted">{project.statement}</p>
        ) : (
          <p className="label mt-4 text-faint">[ positioning pending ]</p>
        )}
      </Link>
    </motion.li>
  );
}

/* --- The archive ----------------------------------------------------------------- */

export function Archive({ items }: { items: ArchiveItem[] }) {
  const [view, setView] = useState<View>("index");
  const [filter, setFilter] = useState("all");
  const [hovered, setHovered] = useState<string | null>(null);
  // Focus dims the rest of the set the way a hover does, but never raises the
  // cursor preview: there is no cursor to put it under.
  const [focused, setFocused] = useState<string | null>(null);
  const fine = useMediaQuery("(hover: hover) and (min-width: 1024px)");
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");

  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const shown = items.filter((item) => active.match(item.project));
  const preview =
    fine && !still && view === "index"
      ? shown.find((i) => i.project.slug === hovered)
      : undefined;
  const lit = hovered ?? focused;

  // A filter can take the hovered row away from under the pointer; the preview
  // is looked up in the shown set, so it simply stops finding it.
  const clear = useCallback(() => setHovered(null), []);

  return (
    <>
      {/* --- Controls -------------------------------------------------------- */}
      <div className="shell sticky top-[var(--nav-h)] z-30 -mx-[var(--gutter)] w-auto border-y border-hairline bg-bg/85 px-(--gutter) backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
          <div
            role="group"
            aria-label="Filter projects"
            className="flex flex-wrap items-center gap-x-1 gap-y-2"
          >
            {FILTERS.map((option) => {
              const count = items.filter((item) =>
                option.match(item.project),
              ).length;
              const on = option.id === filter;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  disabled={count === 0}
                  onClick={() => {
                    setFilter(option.id);
                    clear();
                  }}
                  className={cn(
                    "label relative px-3 py-2 transition-colors disabled:opacity-40",
                    on ? "text-fg" : "text-faint hover:text-muted",
                  )}
                >
                  {option.label}
                  <span className="ml-2 tabular-nums opacity-60">
                    {String(count).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2 -bottom-px block h-px origin-left bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)]",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="View"
            className="flex items-center gap-1"
          >
            {VIEWS.map(({ id, label, Icon }) => {
              const on = id === view;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setView(id);
                    clear();
                  }}
                  className={cn(
                    "label inline-flex items-center gap-2 border px-3 py-2 transition-colors",
                    on
                      ? "border-hairline-strong bg-white/[0.04] text-fg"
                      : "border-transparent text-faint hover:text-muted",
                  )}
                >
                  <Icon aria-hidden strokeWidth={1.5} className="size-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- The set ---------------------------------------------------------- */}
      <div className="shell py-[clamp(2rem,6vh,4rem)]">
        <AnimatePresence mode="wait" initial={false}>
          {view === "index" ? (
            <motion.ul
              key="index"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onPointerLeave={clear}
              className="border-t border-hairline"
            >
              <AnimatePresence initial={false}>
                {shown.map((item) => (
                  <IndexRow
                    key={item.project.slug}
                    item={item}
                    dimmed={Boolean(lit) && lit !== item.project.slug}
                    onEnter={() => setHovered(item.project.slug)}
                    onLeave={clear}
                    onFocus={() => setFocused(item.project.slug)}
                    onBlur={() => setFocused(null)}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <motion.ul
              key="plates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(3rem,8vh,5.5rem)] lg:grid-cols-2"
            >
              <AnimatePresence initial={false}>
                {shown.map((item, i) => (
                  <Plate key={item.project.slug} item={item} index={i} />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <CursorPreview item={preview ?? null} />
    </>
  );
}
