import type { Metadata } from "next";

import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import {
  NameSpecimen,
  SculptureSpecimen,
  TopographySpecimen,
  UplinkSpecimen,
} from "@/components/playground/specimens";
import { SignalField } from "@/components/visuals/signal-field";

/**
 * The playground: the pieces this site is built from, off the pages they work
 * on and handed to the reader.
 *
 * Every specimen is the component the site actually ships, imported rather than
 * rebuilt, with controls wired to its real parameters — so what a visitor turns
 * here is the same code running in the hero, on the about page and under the
 * contact form. Nothing on this page is a recording.
 */

export const metadata: Metadata = {
  title: "Playground",
  description:
    "The interactive pieces this site is built from — the hero sculpture, the name field, the symbol topography and the contact uplink — with their controls exposed.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return (
    <main
      data-surface="dark"
      className="relative isolate overflow-x-clip bg-bg pb-[clamp(2rem,6vh,4rem)] text-fg"
    >
      {/* --- Background ---------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(46rem,100svh)]">
        <SignalField
          strength={0.24}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,#000_45%,transparent)]"
        />
        <div className="absolute -top-[10%] -right-[6%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgb(114_87_255/0.2),transparent_65%)] blur-2xl" />
      </div>

      {/* --- Header --------------------------------------------------------- */}
      <header className="shell grid gap-y-8 pt-[calc(var(--nav-h)+clamp(2.5rem,7vh,4.5rem))] pb-[clamp(2rem,6vh,3.5rem)] lg:grid-cols-12 lg:items-end lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
        <div className="lg:col-span-7">
          <Lift as="p" className="label text-muted">
            <span className="text-accent">05</span>
            <span className="text-faint"> / </span>
            Playground
          </Lift>

          <h1 className="display mt-[clamp(1.25rem,3.5vh,2.25rem)] text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9]">
            <MaskReveal delay={0.06}>Take it</MaskReveal>
            <MaskReveal delay={0.12}>apart</MaskReveal>
          </h1>
        </div>

        <Lift delay={0.2} className="lg:col-span-5">
          <p className="text-lead text-muted">
            The interactive pieces this site is made of, lifted off the pages
            they work on and handed over with their controls. Each one is the
            component the site actually ships &mdash; turn something and you
            are turning the real thing.
          </p>
        </Lift>
      </header>

      <DrawLine className="shell" />

      {/* --- The specimens --------------------------------------------------- */}
      <div className="shell">
        <SculptureSpecimen />
        <NameSpecimen />
        <TopographySpecimen />
        <UplinkSpecimen />
      </div>
    </main>
  );
}
