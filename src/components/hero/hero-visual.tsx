"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { HeroObjectStatic } from "@/components/hero/hero-object-static";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cue, easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * three.js is loaded only when it will actually be used: a wide viewport, a
 * visitor who hasn't asked for reduced motion, and after hydration. Everyone
 * else gets the CSS object and never downloads the chunk.
 */
const HeroScene = dynamic(
  () => import("@/components/hero/hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

/**
 * The set arrives in three separate beats, deliberately pulled apart so none of
 * them lands on top of another:
 *
 * 1. WARM — fetch and evaluate the chunk during a quiet gap in the boot
 *    sequence. This is the long pole (hundreds of KB over the network) and it
 *    costs nothing visible, so it happens early.
 * 2. MOUNT — create the WebGL context and bake the environment probe. Both
 *    block the main thread, so this waits until the last line of the boot
 *    sequence has started. The typing itself is CSS-driven, so even an overrun
 *    cannot make it stutter.
 * 3. REVEAL — fade the container in, but only once the renderer has actually
 *    drawn a frame. Revealing on a timer instead meant fading in an empty box
 *    and then popping the finished scene into it.
 */
const WARM_DELAY = 600;
const MOUNT_DELAY = 2050;
const REVEAL_FLOOR = cue.scene * 1000;
/** If the first frame never arrives, show the set anyway rather than nothing. */
const REVEAL_TIMEOUT = 7000;

export function HeroVisual({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  // Both are effect-driven, so the server and the first client render agree.
  const wide = useMediaQuery("(min-width: 1024px)");
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");
  const container = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [floorPassed, setFloorPassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const use3D = wide && !still;

  // Beats 1 and 2.
  useEffect(() => {
    if (!use3D) return;

    const warm = setTimeout(() => {
      void import("@/components/hero/hero-scene");
    }, WARM_DELAY);
    const mount = setTimeout(() => setMounted(true), MOUNT_DELAY);

    return () => {
      clearTimeout(warm);
      clearTimeout(mount);
    };
  }, [use3D]);

  // Beat 3.
  useEffect(() => {
    const floor = setTimeout(() => setFloorPassed(true), REVEAL_FLOOR);
    const bail = setTimeout(() => setTimedOut(true), REVEAL_TIMEOUT);
    return () => {
      clearTimeout(floor);
      clearTimeout(bail);
    };
  }, []);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onFirstFrame = useCallback(() => setDrawn(true), []);

  // The CSS object has nothing to wait for; the canvas waits for a real frame.
  const revealed = floorPassed && (!use3D || drawn || timedOut);

  return (
    <motion.div
      ref={container}
      className={cn("relative", className)}
      style={style}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.985 }}
      transition={{ duration: 1.15, ease: easing.outQuart }}
    >
      {/* The desk's own shadow. Drawn in the DOM because there is no floor in
          the scene to catch it — the cream page is the floor. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-6%] bottom-[2%] left-[10%] h-[26%] rounded-[50%] blur-[46px]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(24,22,32,0.4) 0%, rgba(24,22,32,0.14) 52%, rgba(24,22,32,0) 78%)",
        }}
      />

      {/* Spill from the cavity onto the page. The light itself is emitted in
          the scene; this is what it throws onto the cream around the set. It
          trails the set slightly, so the glow reads as coming up rather than
          arriving with it. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[-4%] bottom-[8%] left-[14%] h-[22%] rounded-[50%] blur-[42px]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(114,87,255,0.6) 0%, rgba(114,87,255,0.2) 50%, rgba(114,87,255,0) 78%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 1.4, ease: easing.outQuart, delay: revealed ? 0.3 : 0 }}
      />

      {use3D ? (
        mounted ? (
          <div className="absolute inset-0">
            <HeroScene active={inView} onFirstFrame={onFirstFrame} />
          </div>
        ) : null
      ) : (
        <HeroObjectStatic className="absolute inset-0" />
      )}
    </motion.div>
  );
}
