"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

import { LocalTime } from "@/components/contact/local-time";
import { BackToTop } from "@/components/layout/back-to-top";
import { StatusDot } from "@/components/layout/status-dot";
import { Magnetic } from "@/components/motion/magnetic";
import { DrawLine } from "@/components/motion/reveal";
import { projects } from "@/data/projects";
import { contact, navItems, site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * The footer every page ends on.
 *
 * It used to exist only at the bottom of the homepage, so every other page just
 * stopped. It now closes the whole site from the root layout, and does real
 * work as it does: a way into contact, every page and every project one press
 * away, the confirmed channel, and the status, place and local time a visitor
 * wants before writing.
 *
 * The monogram runs the width of the page as an outline, and fills in the
 * accent wherever the pointer passes over it — the same restrained "the page
 * answers you" move the rest of the site makes.
 *
 * The invitation to get in touch steps aside on the two pages that already end
 * on one, the homepage and contact itself, rather than asking twice.
 */

const ROUTES = navItems;

/** Pages that already close on their own invitation to get in touch. */
const HAS_OWN_INVITATION = new Set(["/", "/contact"]);

const pad = (n: number) => String(n).padStart(2, "0");

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label border-b border-hairline pb-3 text-faint">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const monogram = useRef<HTMLDivElement>(null);
  const invite = !HAS_OWN_INVITATION.has(pathname);

  // Written straight to CSS variables: the spotlight moves every frame and is
  // never rendered, so it has no business in React state.
  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = monogram.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
    el.style.setProperty("--spot-r", "clamp(9rem, 18vw, 16rem)");
  };

  return (
    <footer data-surface="dark" className="relative isolate z-20 overflow-hidden bg-bg text-fg">
      <DrawLine onView className="absolute inset-x-0 top-0" />

      {/* --- Background: the page grid, and light pooling at the foot ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_35%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 0.025) 1px, transparent 1px)",
            backgroundSize: "calc((100% - 2 * var(--gutter)) / 12) 100%",
            backgroundPosition: "var(--gutter) 0",
          }}
        />
        <div className="absolute -bottom-[30%] left-1/2 h-[34rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(114_87_255/0.2),transparent_65%)] blur-2xl" />
      </div>

      {/* --- The invitation ---------------------------------------------------- */}
      {invite ? (
        <div className="shell flex flex-col items-start justify-between gap-10 border-b border-hairline py-[clamp(3.5rem,10vh,6.5rem)] md:flex-row md:items-end">
          <div>
            <p className="label text-muted">
              <span className="text-accent">Next</span>
              <span className="text-faint"> / </span>
              Contact
            </p>
            <p className="display mt-5 text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.88]">
              Tell me what
              <br />
              you&rsquo;re <span className="text-accent">building.</span>
            </p>
          </div>
          <Magnetic strength={0.25} radius={100} className="shrink-0">
            <Link
              href="/contact"
              className="group/go relative grid size-[clamp(8.5rem,12vw,11rem)] place-items-center overflow-hidden rounded-full border border-hairline-strong"
            >
              <span
                aria-hidden
                className="absolute inset-0 scale-0 rounded-full bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/go:scale-100"
              />
              <span className="label relative flex flex-col items-center gap-2 text-center text-fg">
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.25}
                  className="size-6 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/go:rotate-45"
                />
                Start a
                <br />
                conversation
              </span>
            </Link>
          </Magnetic>
        </div>
      ) : null}

      {/* --- The directory ----------------------------------------------------- */}
      <div className="shell grid gap-x-[clamp(2rem,4vw,4.5rem)] gap-y-12 py-[clamp(3.5rem,9vh,6rem)] sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link href="/" className="group/home inline-flex items-baseline gap-3">
            <span className="font-mono text-[1.25rem] tracking-[-0.02em] text-fg">
              {site.monogram}
            </span>
            <span className="label text-faint transition-colors group-hover/home:text-fg">
              {site.name}
            </span>
          </Link>
          <p className="mt-4 max-w-[30ch] text-lead text-muted">{site.role}</p>

          <dl className="mt-8 grid max-w-[22rem] gap-2.5 border-t border-hairline pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label text-faint">Status</dt>
              <dd className="label flex items-center gap-2 text-fg">
                <StatusDot />
                {site.status.available}
                <span className="text-faint">/ {site.status.detail}</span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label text-faint">Based in</dt>
              <dd className="label text-fg">{site.location.city}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label text-faint">Local time</dt>
              <dd className="label text-fg tabular-nums">
                <LocalTime timezone={contact.timezone} />
              </dd>
            </div>
          </dl>
        </div>

        <nav aria-label="Pages" className="lg:col-span-2">
          <Column title="Pages">
            <ul className="grid gap-1">
              {ROUTES.map((item, i) => {
                const here = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={here ? "page" : undefined}
                      className="group/page label flex items-center gap-3 py-1.5 transition-colors"
                    >
                      <span className={cn("tabular-nums", here ? "text-accent" : "text-faint")}>
                        {pad(i + 1)}
                      </span>
                      <span
                        className={cn(
                          "transition-[color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover/page:translate-x-1 group-hover/page:text-fg",
                          here ? "text-fg" : "text-muted",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Column>
        </nav>

        <nav aria-label="Projects" className="lg:col-span-3">
          <Column title="Work">
            <ul className="grid gap-1">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/work/${project.slug}`}
                    className="group/proj flex items-baseline justify-between gap-4 py-1.5"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="block size-1.5 rounded-full transition-transform duration-300 group-hover/proj:scale-150"
                        style={{ backgroundColor: project.accent }}
                      />
                      <span className="text-[0.9375rem] tracking-[-0.01em] text-muted transition-[color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover/proj:translate-x-1 group-hover/proj:text-fg">
                        {project.name}
                      </span>
                    </span>
                    <span className="label text-faint">{project.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Column>
        </nav>

        <div className="lg:col-span-3">
          <Column title="Elsewhere">
            <ul className="grid gap-1">
              {contact.channels.map((channel) => (
                <li key={channel.label}>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group/ch label flex items-center justify-between gap-4 py-1.5 text-muted transition-colors hover:text-fg"
                    >
                      <span className="flex items-center gap-3">
                        {channel.label}
                        <span className="text-faint normal-case">{channel.handle}</span>
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        strokeWidth={1.5}
                        className="size-3.5 transition-transform duration-300 group-hover/ch:-translate-y-0.5 group-hover/ch:translate-x-0.5"
                      />
                    </a>
                  ) : (
                    <span className="label flex items-center justify-between gap-4 py-1.5 text-faint">
                      {channel.label}
                      <span className="rounded-full border border-dashed border-hairline px-2 py-0.5">
                        Not yet
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <BackToTop />
            </div>
          </Column>
        </div>
      </div>

      {/* --- The monogram ------------------------------------------------------ */}
      <div
        ref={monogram}
        aria-hidden
        onPointerMove={track}
        onPointerLeave={() => monogram.current?.style.setProperty("--spot-r", "0px")}
        className="relative px-(--gutter) pt-4 select-none"
        style={{ "--spot-r": "0px" } as React.CSSProperties}
      >
        {/* The monogram's underscore is set as a caret rather than a glyph:
            at this size the character falls below the line and gets clipped,
            and a blinking block says the same thing the nav's "AS_" does. */}
        <p className="display flex items-end text-[clamp(5rem,26vw,26rem)] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgb(245_245_245/0.16)]">
          {site.monogram.replace(/_$/, "")}
          <span className="caret-blink mb-[0.05em] ml-[0.08em] inline-block h-[0.06em] w-[0.42em] bg-accent" />
        </p>
        <p
          className="display absolute inset-0 flex items-end px-(--gutter) text-[clamp(5rem,26vw,26rem)] leading-[0.8] text-accent"
          style={{
            maskImage:
              "radial-gradient(circle var(--spot-r) at var(--spot-x, 50%) var(--spot-y, 50%), #000 0%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(circle var(--spot-r) at var(--spot-x, 50%) var(--spot-y, 50%), #000 0%, transparent 100%)",
          }}
        >
          {site.monogram.replace(/_$/, "")}
        </p>
      </div>

      {/* --- The last line ----------------------------------------------------- */}
      <div className="relative border-t border-hairline bg-bg">
        <div className="shell flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-5">
          <p className="label text-faint">
            &copy; {new Date().getFullYear()} {site.name}
          </p>
          <p className="label text-faint">
            Built with Next.js, Motion &amp; React Three Fiber
          </p>
          <p className="label text-faint">
            {site.location.city} <span className="text-faint/60">/</span> {site.location.region}
          </p>
        </div>
      </div>
    </footer>
  );
}
