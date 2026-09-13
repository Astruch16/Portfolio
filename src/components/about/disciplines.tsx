"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { sequenceTone } from "@/components/case/sequence-tones";
import { easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * What I do — three disciplines and the ground they cover.
 *
 * The previous version gave the discipline names all the weight and set the
 * capabilities under them as tiny grey mono labels in the corner of each row,
 * so the part a reader actually wants to scan was the part they could barely
 * see. Here the capabilities are set at reading size, one to a ruled line, and
 * each discipline carries its own colour.
 *
 * Beside them, three overlapping circles — the headline's "whole product" as
 * a drawing. The discipline being read (by scroll, or under the pointer) lights
 * its circle, extends its rule and takes its colour, so the diagram and the
 * list always agree on where you are.
 *
 * Colours come from `sequenceTone` on the dark surface: the site accent for
 * Design, then the status lime and steel the case studies already use.
 */

type Area = { title: string; items: readonly string[] };

const ACCENT = "var(--color-accent)";
const pad = (i: number) => String(i + 1).padStart(2, "0");

/* --- The diagram ------------------------------------------------------------ */

const CIRCLES = [
  { cx: 150, cy: 150, lx: 92, ly: 26, anchor: "middle" },
  { cx: 250, cy: 150, lx: 308, ly: 26, anchor: "middle" },
  { cx: 200, cy: 236, lx: 200, ly: 372, anchor: "middle" },
] as const;

function Overlap({ areas, active }: { areas: readonly Area[]; active: number }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 400 390"
      className="block w-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
    >
      {/* Outlines: drawn in once, owned by Motion, never restyled. */}
      {CIRCLES.map((c, i) => (
        <motion.circle
          key={`outline-${i}`}
          cx={c.cx}
          cy={c.cy}
          r="112"
          fill="none"
          stroke="rgb(255 255 255 / 0.24)"
          strokeWidth="1.25"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 1.2, ease: easing.outQuart, delay: 0.1 + i * 0.14 },
            },
          }}
        />
      ))}

      {/* Highlights: plain elements, so a change of discipline restyles them.
          Motion takes ownership of the style on anything it animates and does
          not pass later changes through — which left the highlight stuck on
          whichever circle was active when the diagram mounted. */}
      {CIRCLES.map((c, i) => {
        const tone = sequenceTone(i, ACCENT);
        const on = i === active;
        return (
          <circle
            key={`fill-${i}`}
            cx={c.cx}
            cy={c.cy}
            r="112"
            style={{
              fill: tone,
              fillOpacity: on ? 0.17 : 0,
              stroke: tone,
              strokeOpacity: on ? 1 : 0,
              strokeWidth: 2,
              transition:
                "fill-opacity 500ms var(--ease-out-quart), stroke-opacity 500ms var(--ease-out-quart)",
            }}
          />
        );
      })}

      {/* The middle — where all three meet. */}
      <motion.g
        variants={{
          hidden: { opacity: 0, scale: 0.6 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easing.outExpo, delay: 0.7 } },
        }}
        style={{ transformOrigin: "200px 180px" }}
      >
        <circle cx="200" cy="180" r="22" fill="none" stroke="rgb(255 255 255 / 0.22)" strokeDasharray="2 4" />
        <circle cx="200" cy="180" r="6" fill="#fff" />
      </motion.g>

      <motion.g
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5, delay: 0.8 } },
        }}
      >
        {CIRCLES.map((c, i) => (
          <text
            key={i}
            x={c.lx}
            y={c.ly}
            textAnchor={c.anchor}
            style={{
              fill: i === active ? sequenceTone(i, ACCENT) : "rgb(255 255 255 / 0.4)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              transition: "fill 500ms var(--ease-out-quart)",
            }}
          >
            {areas[i].title}
          </text>
        ))}
      </motion.g>
    </motion.svg>
  );
}

/* --- The list --------------------------------------------------------------- */

export function Disciplines({ areas }: { areas: readonly Area[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Same approach as the story above it: whichever discipline crosses a band
  // just above the middle of the viewport is the one being read.
  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const blocks = root.querySelectorAll<HTMLElement>("[data-discipline]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number(entry.target.getAttribute("data-discipline")));
          }
        }
      },
      { rootMargin: "-40% 0px -52% 0px" },
    );

    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  }, []);

  const activeTone = sequenceTone(active, ACCENT);

  return (
    <div ref={container} className="grid gap-x-[clamp(2rem,5vw,5.5rem)] gap-y-12 lg:grid-cols-12">
      {/* --- Diagram: pinned beside the list on a wide screen ------------- */}
      <div className="lg:col-span-5">
        <div className="relative isolate mx-auto max-w-[26rem] lg:sticky lg:top-[calc(var(--nav-h)+4rem)] lg:max-w-none">
          {/* A glow in the colour of whatever is being read. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[8%] -z-10 rounded-full blur-[70px] transition-[background-color] duration-700"
            style={{ backgroundColor: activeTone, opacity: 0.16 }}
          />
          <Overlap areas={areas} active={active} />
        </div>
      </div>

      <ol className="lg:col-span-7">
        {areas.map((area, i) => {
          const tone = sequenceTone(i, ACCENT);
          const on = i === active;

          return (
            <li
              key={area.title}
              data-discipline={i}
              onPointerEnter={() => setActive(i)}
              onFocusCapture={() => setActive(i)}
              className="relative py-[clamp(2.5rem,7vh,4.5rem)] first:pt-0"
            >
              <div className="relative">
                <p className="label" style={{ color: tone }}>
                  {pad(i)}
                </p>
                <h3
                  className="display mt-3 text-[clamp(2.75rem,6vw,5rem)] leading-[0.88] transition-colors duration-500"
                  style={{ color: on ? tone : "var(--surface-fg)" }}
                >
                  {area.title}
                </h3>

                {/* Grows from a stub to the full width as the discipline comes
                    into focus — the same move as the nav's active rule. */}
                <span
                  aria-hidden
                  className="mt-7 block h-[2px] origin-left transition-transform duration-700 ease-[var(--ease-out-expo)]"
                  style={{
                    backgroundColor: tone,
                    transform: `scaleX(${on ? 1 : 0.08})`,
                  }}
                />

                <ul className="mt-2 grid gap-x-10 sm:grid-cols-2">
                  {area.items.map((item, j) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                      transition={{ duration: 0.5, ease: easing.outQuart, delay: 0.05 * j }}
                      className="group/item flex items-center gap-4 border-b border-hairline py-[1.1rem]"
                    >
                      <span
                        aria-hidden
                        className="block h-[2px] w-3 shrink-0 transition-[width] duration-300 ease-[var(--ease-out-expo)] group-hover/item:w-7"
                        style={{ backgroundColor: tone }}
                      />
                      <span
                        className={cn(
                          "text-[clamp(1.15rem,1.65vw,1.5rem)] leading-tight tracking-[-0.015em] transition-[color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover/item:translate-x-1",
                          on ? "text-fg" : "text-fg/80",
                        )}
                      >
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
