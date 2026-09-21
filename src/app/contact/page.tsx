import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CarrierWave } from "@/components/contact/carrier-wave";
import { ChannelList } from "@/components/contact/channel-list";
import { ContactForm } from "@/components/contact/contact-form";
import { LocalTime } from "@/components/contact/local-time";
import { TopicShortcuts } from "@/components/contact/topic-shortcuts";
import { StatusDot } from "@/components/layout/status-dot";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { buildLog } from "@/data/build-log";
import { projects } from "@/data/projects";
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
 * Server-rendered around the islands that have to move: the clock, the form,
 * and the carrier under the headline — a live link that answers the pointer
 * and every key pressed in the form, so the page is visibly listening before a
 * word has been sent.
 */

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — design engineer and full-stack developer in ${site.location.city}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const latest = [...buildLog].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <main className="relative">
      {/* === Region 1 — dark: the ask + the address ====================== */}
      <section
        data-surface="dark"
        className="relative isolate overflow-x-clip bg-bg text-fg"
      >
        {/* Same background construction as the build log: a faint grid, one
            restrained glow. No particles, no moving anything. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
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
            <MaskReveal onView delay={0.08}>
              you&rsquo;re building.
            </MaskReveal>
          </h1>

          <Lift
            onView
            delay={0.16}
            className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[54ch]"
          >
            <p className="text-lead text-muted">
              Whether it&rsquo;s a role, a product that needs building or
              something you&rsquo;re still working out — I read everything, and
              I&rsquo;d rather hear the specifics than a generic hello.
            </p>
          </Lift>
        </header>

        {/* --- The link ------------------------------------------------
            The channel, drawn: it lifts under the pointer, and every key
            pressed in the form below sends a pulse down it. */}
        <div className="shell mt-[clamp(2rem,6vh,3.5rem)]">
          <Lift onView delay={0.2}>
            <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2">
              <p className="label text-faint">
                <span className="text-accent">Channel</span>
                <span className="text-faint/60"> / </span>
                Open
              </p>
              <p className="label flex items-center gap-2.5 text-faint">
                <StatusDot />
                {site.location.city}
                <span className="text-faint/60">/</span>
                <span className="text-fg tabular-nums">
                  <LocalTime timezone={contact.timezone} />
                </span>
              </p>
            </div>
            <CarrierWave className="h-[clamp(4.5rem,11vh,7rem)] w-full" />
          </Lift>
        </div>

        <div
          id="write"
          className="shell scroll-mt-[calc(var(--nav-h)+1.5rem)] pt-[clamp(2rem,5vh,3.5rem)] pb-[clamp(3.5rem,10vh,7rem)]"
        >
          <Lift onView delay={0.22} className="mb-8">
            <p className="label text-faint">Write to me</p>
          </Lift>
          <ContactForm />
        </div>
      </section>

      {/* === Region 2 — light: channels + what's worth writing about =====
          Both halves are lists of ways in rather than lists to read: a channel
          row opens the account, and a line from "worth writing about" fills the
          form above with the option it matches and puts the cursor in the
          message. Each heading stays with its list as it scrolls. */}
      <section data-surface="light" className="relative bg-bg text-fg">
        <div className="shell shell-grid gap-y-[clamp(3.5rem,9vh,6rem)] py-[clamp(4rem,11vh,8rem)]">
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)]">
              <Lift onView as="p" className="label text-muted">
                <span className="text-accent">Elsewhere</span>
                <span className="text-faint"> / </span>
                Channels
              </Lift>
              <Lift onView delay={0.06} className="mt-6 max-w-[34ch]">
                <p className="text-lead text-muted">
                  The form is the fastest way to reach me. These are the other
                  places the work shows up.
                </p>
              </Lift>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <ChannelList />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)]">
              <Lift onView as="p" className="label text-muted">
                <span className="text-accent">Worth</span>
                <span className="text-faint"> / </span>
                Writing about
              </Lift>
              <Lift onView delay={0.06} className="mt-6 max-w-[34ch]">
                <p className="text-lead text-muted">
                  Pick the one that fits and it fills the form for you, back at
                  the top of the page.
                </p>
              </Lift>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <TopicShortcuts />
          </div>
        </div>
      </section>

      {/* === Region 3 — dark: before you write, and where else to look =====
          It was four small readings and two buttons in a band mostly made of
          space. Now the readings are tiles set at a size worth reading, and
          the two ways on are panels that say what's behind them — counted
          from the data, so neither can go stale. */}
      <section
        data-surface="dark"
        className="relative overflow-x-clip bg-bg text-fg"
      >
        <DrawLine onView className="absolute inset-x-0 top-0" />

        <div className="shell grid gap-x-[clamp(2rem,4vw,4.5rem)] gap-y-12 py-[clamp(3.5rem,9vh,6rem)] lg:grid-cols-12">
          {/* --- The readings ------------------------------------------- */}
          <div className="lg:col-span-5">
            <Lift onView as="p" className="label text-muted">
              <span className="text-accent">Details</span>
              <span className="text-faint"> / </span>
              Before you write
            </Lift>

            <Lift
              onView
              delay={0.06}
              className="mt-6 grid grid-cols-2 gap-px border border-hairline bg-hairline"
            >
              {[
                {
                  label: "Status",
                  value: (
                    <span className="inline-flex items-center gap-2.5">
                      <StatusDot />
                      {site.status.available}
                    </span>
                  ),
                  note: site.status.detail,
                },
                {
                  label: "Based",
                  value: site.location.city,
                  note: site.location.region,
                },
                {
                  label: "Local time",
                  value: <LocalTime timezone={contact.timezone} />,
                  note: "Pacific",
                },
                {
                  label: "Reply",
                  value: "Within a few days",
                  note: "Usually sooner",
                },
              ].map((tile, i) => (
                <div key={tile.label} className="bg-bg p-5 sm:p-6">
                  <p className="label text-faint">
                    {String(i + 1).padStart(2, "0")}
                    <span className="text-faint/60"> / </span>
                    {tile.label}
                  </p>
                  <p className="mt-4 font-mono text-[clamp(0.95rem,1.4vw,1.25rem)] leading-[1.2] font-medium tracking-[0.01em] text-fg uppercase tabular-nums">
                    {tile.value}
                  </p>
                  <p className="label mt-2 text-muted">{tile.note}</p>
                </div>
              ))}
            </Lift>
          </div>

          {/* --- The ways on -------------------------------------------- */}
          <div className="lg:col-span-7">
            <Lift onView as="p" className="label text-muted">
              <span className="text-accent">Or</span>
              <span className="text-faint"> / </span>
              Look around first
            </Lift>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Lift onView delay={0.1}>
                <Link
                  href="/work"
                  className="group/way relative isolate flex h-full min-h-[15rem] flex-col justify-between overflow-hidden border border-hairline-strong p-6 transition-colors duration-500 hover:border-accent sm:p-7"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[linear-gradient(to_top,rgb(114_87_255/0.16),transparent)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/way:scale-y-100"
                  />
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="label text-faint">The work</span>
                    <ArrowUpRight
                      aria-hidden
                      strokeWidth={1.5}
                      className="size-4 text-muted transition-all duration-300 ease-[var(--ease-out-expo)] group-hover/way:-translate-y-0.5 group-hover/way:translate-x-0.5 group-hover/way:text-fg"
                    />
                  </span>
                  <span>
                    <span className="block font-mono text-[clamp(2.5rem,4.5vw,3.75rem)] leading-none tracking-[-0.04em] text-fg tabular-nums">
                      {String(projects.length).padStart(2, "0")}
                    </span>
                    <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                      {projects.map((project) => (
                        <span
                          key={project.slug}
                          className="label inline-flex items-center gap-1.5 text-muted"
                        >
                          <span
                            aria-hidden
                            className="block size-1.5 rounded-full"
                            style={{ backgroundColor: project.accent }}
                          />
                          {project.name}
                        </span>
                      ))}
                    </span>
                    <span className="display mt-6 block text-[clamp(1.5rem,2.4vw,2rem)] leading-none text-fg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/way:translate-x-1">
                      See the work first
                    </span>
                  </span>
                </Link>
              </Lift>

              <Lift onView delay={0.16}>
                <Link
                  href="/build-log"
                  className="group/way relative isolate flex h-full min-h-[15rem] flex-col justify-between overflow-hidden border border-hairline-strong p-6 transition-colors duration-500 hover:border-accent sm:p-7"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[linear-gradient(to_top,rgb(182_229_59/0.1),transparent)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/way:scale-y-100"
                  />
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="label text-faint">The build log</span>
                    <ArrowUpRight
                      aria-hidden
                      strokeWidth={1.5}
                      className="size-4 text-muted transition-all duration-300 ease-[var(--ease-out-expo)] group-hover/way:-translate-y-0.5 group-hover/way:translate-x-0.5 group-hover/way:text-fg"
                    />
                  </span>
                  <span>
                    <span className="block font-mono text-[clamp(2.5rem,4.5vw,3.75rem)] leading-none tracking-[-0.04em] text-fg tabular-nums">
                      {String(buildLog.length).padStart(2, "0")}
                    </span>
                    <span className="label mt-3 block text-faint">
                      Latest{" "}
                      <span className="text-muted tabular-nums">
                        {latest.date.replaceAll("-", ".")}
                      </span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-muted">
                      {latest.title}
                    </span>
                    <span className="display mt-6 block text-[clamp(1.5rem,2.4vw,2rem)] leading-none text-fg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/way:translate-x-1">
                      Read the build log
                    </span>
                  </span>
                </Link>
              </Lift>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
