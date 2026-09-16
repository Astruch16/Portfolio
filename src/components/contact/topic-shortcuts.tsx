"use client";

import { ArrowUp } from "lucide-react";

import { Lift } from "@/components/motion/reveal";
import { contact } from "@/data/site";
import { contactIntent } from "@/lib/contact-intent";
import type { Topic } from "@/lib/contact-message";

/**
 * What's worth writing about — as a way into the form rather than a list to
 * read and then act on.
 *
 * Each line picks the matching option in the form above and puts the cursor in
 * the message, so a visitor who recognises their reason for writing is one
 * click from writing it. Each is a real link to the form as well, so without
 * JavaScript it still takes them to the right place; the topic is then theirs
 * to pick, exactly as before.
 *
 * The pairing is a shortcut in the interface, not a claim: the lines are
 * Adam's, the four options are the form's, and this only says which option a
 * line would lead to.
 */
const LEADS_TO: Topic[] = ["A role", "A product to build", "Freelance work", "Something else"];

export function TopicShortcuts() {
  return (
    <ol>
      {contact.wants.map((want, i) => {
        const topic = LEADS_TO[i] ?? "Something else";
        return (
          <Lift
            key={want}
            onView
            delay={0.06 + i * 0.06}
            as="li"
            className="border-t border-hairline last:border-b"
          >
            <a
              href="#write"
              onClick={() => contactIntent.choose(topic)}
              className="group/want relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-[-1rem] w-[calc(100%+2rem)] origin-left scale-x-0 bg-ink/[0.04] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/want:scale-x-100"
              />
              <span className="label relative text-faint transition-colors group-hover/want:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative text-lead text-muted transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover/want:translate-x-1 group-hover/want:text-fg">
                {want}
              </span>
              <span className="label relative col-start-2 mt-2 flex items-center gap-2 text-faint transition-colors group-hover/want:text-fg sm:col-start-3 sm:mt-0 sm:justify-self-end">
                <span className="hidden sm:inline">Write about this</span>
                <span className="sm:hidden">{topic}</span>
                <ArrowUp
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/want:-translate-y-0.5"
                />
              </span>
            </a>
          </Lift>
        );
      })}
    </ol>
  );
}
