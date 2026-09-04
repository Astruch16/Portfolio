"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { MobileMenu } from "@/components/layout/mobile-menu";
import { StatusDot } from "@/components/layout/status-dot";
import { Magnetic } from "@/components/motion/magnetic";
import { navItems, site, type NavItem } from "@/data/site";
import { useSurfaceObserver } from "@/hooks/use-surface-observer";
import { cue, duration, easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 24;

export function Navigation() {
  const surface = useSurfaceObserver("light");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD;
      // Only re-render on the crossing, not on every scroll event.
      setScrolled((current) => (current === next ? current : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      data-surface={surface}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.slow, ease: easing.outQuart, delay: cue.nav }}
      className="fixed inset-x-0 top-0 z-50 text-fg"
    >
      {/* Transparent over the hero, solid once the page moves under it. No
          blur, no floating pill — the bar belongs to the page it sits on. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-bg transition-opacity duration-500 ease-[var(--ease-out-quart)]",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="shell shell-grid h-(--nav-h) items-center">
        <div className="col-span-6 md:col-span-2">
          {/* The one branded control on the page, so it gets the one magnetic
              pull — small enough that it never moves out from under the cursor. */}
          <Magnetic strength={0.18} radius={56} className="inline-block">
            <Link
              href="/"
              aria-label={`${site.name} — home`}
              className="inline-block font-mono text-sm font-medium tracking-tight text-fg"
            >
              {site.monogram}
            </Link>
          </Magnetic>
        </div>

        <nav
          aria-label="Primary"
          className="col-span-10 hidden items-center gap-[clamp(1.5rem,3vw,3rem)] md:flex lg:col-span-7"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
        </nav>

        <div className="col-span-3 hidden items-center justify-end gap-6 lg:flex">
          <span className="label flex items-center gap-2 text-[0.6875rem] font-medium tracking-[0.16em] text-muted">
            <StatusDot />
            Status: {site.status.label}
          </span>
          {/* Becomes the terminal trigger once the terminal ships. Rendered as
              a mark rather than a button so nothing looks clickable yet. */}
          <span aria-hidden className="font-mono text-sm font-medium text-faint">
            &gt;<span className="caret-blink">_</span>
          </span>
        </div>

        <div className="col-span-6 flex justify-end md:hidden">
          <MobileMenu />
        </div>
      </div>

      {/* Sits inside the shell rather than bleeding edge to edge, so it runs
          exactly from the monogram to the terminal mark. Always present — it
          is what gives the bar its edge before the background arrives. */}
      <div aria-hidden className="shell pointer-events-none absolute inset-x-0 bottom-0">
        <span className="block h-px w-full bg-hairline" />
      </div>
    </motion.header>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group relative block py-1"
    >
      {/* Two stacked copies of the label: the resting one leaves upward as the
          accent copy arrives. CSS only — no listener, no state. */}
      <span className="relative block overflow-hidden">
        <span
          className={cn(
            "label block text-[0.6875rem] font-medium tracking-[0.16em] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-full",
            active ? "text-fg" : "text-muted",
          )}
        >
          {item.label}
        </span>
        <span
          aria-hidden
          className="label absolute inset-0 block translate-y-full text-[0.6875rem] font-medium tracking-[0.16em] text-fg transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
        >
          {item.label}
        </span>
      </span>

      <span
        aria-hidden
        className={cn(
          "absolute -bottom-0.5 left-0 block h-px w-full origin-left bg-signal transition-transform duration-300 ease-[var(--ease-out-expo)]",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}
