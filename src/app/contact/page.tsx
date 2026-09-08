import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { LocalTime } from "@/components/contact/local-time";
import { StatusDot } from "@/components/layout/status-dot";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { contact, site } from "@/data/site";

/**
 * The contact page.
 *
 * The form is the point: it keeps Adam's address out of the page, the bundle
 * and this repository, where a published address would be scraped within days.
 * The destination mailbox is server-side configuration.
 *
 * Two dark regions either side of a light one, so the page has the same
 * surface rhythm as the rest of the site and the nav inverts through it.
 * Server-rendered apart from two small islands: the clock and the copy button.
 */

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — design engineer and full-stack developer in ${site.location.city}.`,
  alternates: { canonical: "/contact" },
};

/** A reading in the details rail: tiny indexed label, then the value. */
function Detail({
  index,
  label,
  children,
  note,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="border-t border-hairline pt-4">
      <p className="label text-faint">
        {index} <span className="text-faint/60">/</span> {label}
      </p>
      <p className="mt-3 font-mono text-[0.875rem] leading-[1.4] font-medium tracking-[0.02em] text-fg uppercase">
        {children}
      </p>
      {note ? (
        <p className="mt-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-muted uppercase">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="relative">
      {/* === Region 1 — dark: the ask + the address ====================== */}
      <section
        data-surface="dark"
        className="relative isolate overflow-x-clip bg-bg text-fg"
      >
        {/* Same background construction as the build log: a faint grid, one
            restrained glow. No particles, no moving anything. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 255 255 / 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.02) 1px, transparent 1px)",
              backgroundSize: "clamp(64px, 7vw, 104px) clamp(64px, 7vw, 104px)",
              maskImage:
                "radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 100%)",
            }}
          />
          <div
            className="absolute -top-[8%] -right-[10%] h-[36rem] w-[36rem] rounded-full opacity-40 blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgb(114 87 255 / 0.35) 0%, transparent 70%)",
            }}
          />
        </div>

        <header className="shell pt-[calc(var(--nav-h)+clamp(2.5rem,7vh,4.5rem))]">
          <Lift as="p" className="label text-muted">
            <span className="text-accent">05</span>
            <span className="text-faint"> / </span>
            Contact
          </Lift>

          <h1 className="display mt-[clamp(1.25rem,3.5vh,2.25rem)] text-[clamp(2.5rem,7.4vw,5.5rem)] leading-[0.92]">
            <MaskReveal onView>Tell me what</MaskReveal>
            <MaskReveal onView delay={0.08}>you&rsquo;re building.</MaskReveal>
          </h1>

          <Lift onView delay={0.16} className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[54ch]">
            <p className="text-lead text-muted">
              Whether it&rsquo;s a role, a product that needs building or
              something you&rsquo;re still working out — I read everything, and
              I&rsquo;d rather hear the specifics than a generic hello.
            </p>
          </Lift>
        </header>

        <div className="shell pt-[clamp(2.5rem,7vh,4.5rem)] pb-[clamp(3.5rem,10vh,7rem)]">
          <Lift onView delay={0.22}>
            <p className="label text-faint">Write to me</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </Lift>
        </div>
      </section>

      {/* === Region 2 — light: channels + what's worth writing about ===== */}
      <section data-surface="light" className="relative bg-bg text-fg">
        <div className="shell shell-grid gap-y-[clamp(3rem,7vh,4.5rem)] py-[clamp(4rem,11vh,8rem)]">
          <div className="col-span-12 lg:col-span-5">
            <Lift onView as="p" className="label text-muted">
              <span className="text-accent">Elsewhere</span>
              <span className="text-faint"> / </span>
              Channels
            </Lift>
            <Lift onView delay={0.06} className="mt-6 max-w-[38ch]">
              <p className="text-lead text-muted">
                Email is the fastest way to reach me. These are the other places
                the work shows up.
              </p>
            </Lift>
          </div>

          <ul className="col-span-12 lg:col-span-7">
            {contact.channels.map((channel, i) => {
              const row = (
                <>
                  <span className="flex items-baseline gap-4">
                    <span className="label w-24 shrink-0 text-faint">
                      {channel.label}
                    </span>
                    <span className="font-mono text-[0.9375rem] tracking-[0.02em] text-fg">
                      {channel.handle ?? (
                        <span className="label text-faint" title="Awaiting a confirmed account">
                          [ handle pending ]
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="mt-2 block pl-0 font-mono text-[0.6875rem] leading-[1.7] tracking-[0.06em] text-muted uppercase sm:pl-28">
                    {channel.note}
                  </span>
                </>
              );

              return (
                <Lift
                  key={channel.label}
                  onView
                  delay={0.06 + i * 0.06}
                  as="li"
                  className="border-t border-hairline last:border-b"
                >
                  {channel.href ? (
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block py-6"
                    >
                      {row}
                      <ArrowUpRight
                        aria-hidden
                        strokeWidth={1.5}
                        className="absolute top-6 right-0 size-4 text-faint transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      />
                    </a>
                  ) : (
                    <div className="block py-6">{row}</div>
                  )}
                </Lift>
              );
            })}
          </ul>

          <div className="col-span-12 lg:col-span-5">
            <Lift onView as="p" className="label text-muted">
              <span className="text-accent">Worth</span>
              <span className="text-faint"> / </span>
              Writing about
            </Lift>
          </div>

          <ul className="col-span-12 lg:col-span-7">
            {contact.wants.map((want, i) => (
              <Lift
                key={want}
                onView
                delay={0.06 + i * 0.06}
                as="li"
                className="flex gap-6 border-t border-hairline py-4 last:border-b"
              >
                <span className="label shrink-0 text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lead text-muted">{want}</span>
              </Lift>
            ))}
          </ul>
        </div>
      </section>

      {/* === Region 3 — dark: the details rail + a way back ============== */}
      <section
        data-surface="dark"
        className="relative overflow-x-clip bg-bg pb-[clamp(3rem,10vh,7rem)] text-fg"
      >
        <DrawLine onView className="absolute inset-x-0 top-0" />

        <div className="shell py-[clamp(3.5rem,10vh,7rem)]">
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <Lift onView>
              <Detail index="01" label="Status" note={site.status.detail}>
                <span className="inline-flex items-center gap-2.5">
                  <StatusDot />
                  {site.status.open}
                </span>
              </Detail>
            </Lift>
            <Lift onView delay={0.06}>
              <Detail index="02" label="Based" note={site.location.region}>
                {site.location.city}
              </Detail>
            </Lift>
            <Lift onView delay={0.12}>
              <Detail index="03" label="Time" note="Pacific">
                <LocalTime timezone={contact.timezone} />
              </Detail>
            </Lift>
            <Lift onView delay={0.18}>
              <Detail index="04" label="Reply" note="Usually sooner">
                Within a few days
              </Detail>
            </Lift>
          </div>

          <Lift onView delay={0.24} className="mt-[clamp(3rem,8vh,5rem)] flex flex-wrap gap-4">
            <Link
              href="/work"
              className="group/w label inline-flex items-center gap-3 bg-fg px-6 py-3.5 text-bg transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
            >
              See the work first
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/w:translate-x-1"
              />
            </Link>
            <Link
              href="/build-log"
              className="group/b label inline-flex items-center gap-3 border border-hairline-strong px-6 py-3.5 text-fg transition-colors hover:bg-fg hover:text-bg"
            >
              Read the build log
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/b:translate-x-1"
              />
            </Link>
          </Lift>
        </div>
      </section>
    </main>
  );
}
