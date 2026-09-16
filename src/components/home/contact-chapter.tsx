import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { LocalTime } from "@/components/contact/local-time";
import { Magnetic } from "@/components/motion/magnetic";
import { Lift, MaskReveal } from "@/components/motion/reveal";
import { contact, site } from "@/data/site";

/**
 * 04 — Contact.
 *
 * The headline and the list of what's worth writing about are the contact
 * page's own; the button goes there. Around the button a ring of text turns
 * slowly, and the button leans toward the pointer. Status, place and the local
 * clock sit under it, because "am I writing into someone's working day?" is
 * the question right before sending.

 */

const RING = "Start a conversation · Start a conversation · ";

export function ContactChapter() {
  return (
    <section
      id="contact"
      data-surface="light"
      data-chapter="04"
      aria-labelledby="contact-heading"
      className="relative isolate z-20 overflow-hidden bg-bg py-[clamp(5rem,14vh,10rem)] text-fg"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000)]" />
        <div className="hero-spill absolute right-[-18%] bottom-[-30%] h-[90%] w-[70%]" />
      </div>

      <div className="shell grid gap-y-16 lg:grid-cols-12 lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
        <div className="lg:col-span-8">
          <Lift onView as="p" className="label text-muted">
            <span className="text-accent">04</span>
            <span className="text-faint"> / </span>Contact
          </Lift>
          <h2
            id="contact-heading"
            className="display mt-[clamp(1.5rem,4vh,2.5rem)] text-[clamp(3rem,8.4vw,8.5rem)] leading-[0.86]"
          >
            <MaskReveal onView delay={0.05}>
              Tell me what
            </MaskReveal>
            <MaskReveal onView delay={0.12}>
              you&rsquo;re <span className="text-accent">building.</span>
            </MaskReveal>
          </h2>

          <Lift
            onView
            delay={0.2}
            className="mt-[clamp(2.5rem,6vh,4rem)] max-w-[40rem]"
          >
            <p className="label border-b border-hairline pb-3 text-faint">
              Worth writing about
            </p>
            <ol>
              {contact.wants.map((want, i) => (
                <li
                  key={want}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline border-b border-hairline py-3.5"
                >
                  <span className="label text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[1.0625rem] tracking-[-0.01em]">
                    {want}
                  </span>
                </li>
              ))}
            </ol>
          </Lift>
        </div>

        {/* --- The way in -------------------------------------------------- */}
        <div className="flex flex-col items-start justify-end gap-10 lg:col-span-4 lg:items-end">
          <Lift onView delay={0.25}>
            <Magnetic strength={0.28} radius={120}>
              <Link
                href="/contact"
                className="group/cta relative grid size-[clamp(12rem,18vw,15rem)] place-items-center rounded-full"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 200 200"
                  className="ring-turn absolute inset-0 size-full"
                >
                  <defs>
                    <path
                      id="contact-ring"
                      d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0"
                    />
                  </defs>
                  <text className="fill-current font-mono text-[11.5px] tracking-[0.2em] uppercase">
                    <textPath href="#contact-ring">{RING}</textPath>
                  </text>
                </svg>
                <span className="relative grid size-[62%] place-items-center overflow-hidden rounded-full bg-ink text-paper">
                  <span
                    aria-hidden
                    className="absolute inset-0 scale-0 rounded-full bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/cta:scale-100"
                  />
                  <ArrowUpRight
                    aria-hidden
                    className="relative size-8 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/cta:rotate-45"
                    strokeWidth={1.25}
                  />
                </span>
                <span className="sr-only">Start a conversation</span>
              </Link>
            </Magnetic>
          </Lift>

          <Lift
            onView
            delay={0.3}
            className="w-full max-w-[20rem] lg:text-right"
          >
            <dl className="grid gap-3 border-t border-hairline pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="label text-faint">Status</dt>
                <dd className="label flex items-center gap-2 text-fg">
                  <span className="block size-1.5 rounded-full bg-[#5f8a12]" />
                  {site.status.available}
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
          </Lift>
        </div>
      </div>
    </section>
  );
}
