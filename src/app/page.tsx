import { Hero } from "@/components/hero/hero";
import { CapabilitiesChapter } from "@/components/home/capabilities-chapter";
import { ChapterRail, type Chapter } from "@/components/home/chapter-rail";
import { ContactChapter } from "@/components/home/contact-chapter";
import { LogChapter } from "@/components/home/log-chapter";
import { WorkChapter } from "@/components/home/work-chapter";

/** The chapters under the hero, in order, as the rail names them. */
const CHAPTERS: Chapter[] = [
  { id: "work", index: "01", label: "Work" },
  { id: "capabilities", index: "02", label: "What I do" },
  { id: "build-log", index: "03", label: "Build log" },
  { id: "contact", index: "04", label: "Contact" },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <WorkChapter />
      <CapabilitiesChapter />
      <LogChapter />
      <ContactChapter />
      <ChapterRail chapters={CHAPTERS} />
    </>
  );
}
