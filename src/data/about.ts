/**
 * The about page's content, and the only place it lives.
 *
 * Every word here is Adam's. The page redesign changed how this is presented,
 * never what it says — so this file is a straight lift of the copy that was
 * already written, with the structure pulled out of the markup so the page
 * reads as layout rather than as a wall of strings.
 */

export const about = {
  eyebrow: "About",
  /** Set as the opening statement; each line is its own masked reveal. */
  headline: ["I didn’t start", "in software."],
  lead: "I got here by building things I needed.",

  /** Set apart at statement size. Splitting the first paragraph here is a
   *  typographic decision — the words and their order are unchanged. */
  storyLead: "I came into software from a completely different path.",
  story: [
    "My background is in earth science and real estate, but over time I became increasingly interested in building software to solve problems I was experiencing myself.",
    "What started as learning how to build simple tools gradually turned into full products used by real people.",
    "The part I enjoyed most wasn’t only writing code. It was taking an idea, understanding the problem, designing the experience, building the system and turning it into something people could actually use — which is what pushed me toward design engineering and full-stack product development.",
  ],

  /** Where he came from, in order. Notes are the annotation under each stop. */
  progression: [
    { label: "Earth science", note: "where I started" },
    { label: "Real estate", note: "the problems I lived" },
    { label: "Internal tools", note: "solving my own" },
    { label: "Shipping products", note: "used by real people" },
    { label: "Design engineering", note: "design × build × product" },
  ],

  areasHeadline: "I like working across the whole product.",
  areas: [
    {
      title: "Design",
      items: [
        "Product thinking",
        "UI / UX",
        "Interaction design",
        "Design systems",
        "Prototyping",
      ],
    },
    {
      title: "Engineering",
      items: [
        "Full-stack development",
        "Frontend systems",
        "APIs",
        "Databases",
        "Authentication",
        "Performance",
      ],
    },
    {
      title: "Product",
      items: [
        "Problem discovery",
        "User feedback",
        "Iteration",
        "Shipping",
        "Analytics",
        "Growth thinking",
      ],
    },
  ],

  /** A working toolkit — never a skills-with-percentages list. */
  toolkitNote: "A working set of tools I reach for, not a scoreboard.",
  toolkit: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "PostgreSQL",
    "Neon",
    "Prisma",
    "Clerk",
    "NextAuth",
    "Vercel",
    "Git",
  ],

  process: [
    { word: "Think", body: "Understand the problem before building the solution." },
    { word: "Design", body: "Make the experience clear before adding complexity." },
    {
      word: "Build",
      body: "Use the simplest architecture that can scale with the product.",
    },
    { word: "Test", body: "Put the product in front of real users and listen." },
    { word: "Ship", body: "Finish the thing, learn from it, and improve it." },
  ],

  outside: ["Real estate", "Pokémon", "Golf", "Building businesses"],

  closing: {
    headline: ["Looking for", "the right team."],
    body: "I’m interested in roles where design, engineering and product overlap — especially teams building ambitious software where I can stay close to both the user experience and the code.",
  },
} as const;
