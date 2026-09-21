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
  headline: ["I didn’t start", "in software"],
  lead: "I got here by building things I needed.",

  /**
   * The route in, told as chapters.
   *
   * `stops` are the five places on the rail. `beats` are the chapters the
   * reader scrolls through — each one is a whole sentence or paragraph of the
   * original story, unedited, tagged with the stops it covers and the drawing
   * that goes with it. The story was only divided where it already moves from
   * one place to the next.
   *
   * One exception: the first chapter's text is DRAFT copy, written without
   * specifics — it describes the field, not Adam's own work in it. Replace it
   * with the real detail (what he did, where, for how long) before launch.
   *
   * `moments` are PLACEHOLDER prompts, not copy: three beats under each
   * chapter, each a heading and a one-line prompt for what belongs there, with
   * a photo slot. They exist to show the design. Replace the title and note
   * with the real moment, set `image` to a file in /public, and drop
   * `placeholder` — the tag and the empty photo slot both disappear with it.
   */
  path: {
    /** Heads the whole section, level with the panel's label. */
    headline: "I came into software from a completely different path.",
    stops: [
      { label: "Hydrogeology", note: "where I started" },
      { label: "Real estate", note: "the problems I lived" },
      { label: "Internal tools", note: "solving my own" },
      { label: "Shipping products", note: "used by real people" },
      { label: "Design engineering", note: "design × build × product" },
    ],
    beats: [
      {
        stops: [0],
        moments: [
          { placeholder: true, title: "Where it began", note: "A line or two on how you got into hydrogeology." },
          { placeholder: true, title: "What the work taught", note: "A line or two on the kind of problems you worked on." },
          { placeholder: true, title: "The move away", note: "A line or two on what pulled you toward something new." },
        ],
        figure: "contours",
        // DRAFT — see the note above.
        text: "I started in hydrogeology: the study of how water moves underground, through systems you can never see directly. The work is reading patterns out of incomplete data, building a model of how something behaves, and testing it against what the ground actually does. That way of thinking came with me into everything I’ve built since.",
      },
      {
        stops: [1],
        moments: [
          { placeholder: true, title: "Getting into real estate", note: "A line or two on how real estate started for you." },
          { placeholder: true, title: "The recurring problem", note: "A line or two on the problem you kept running into." },
          { placeholder: true, title: "Deciding to build", note: "A line or two on why you built a tool instead of finding one." },
        ],
        figure: "parcels",
        text: "My background is in earth science and real estate, but over time I became increasingly interested in building software to solve problems I was experiencing myself.",
      },
      {
        stops: [2, 3],
        moments: [
          { placeholder: true, title: "The first tool", note: "A line or two on the first thing you built for yourself." },
          { placeholder: true, title: "Someone else using it", note: "A line or two on when it first reached another person." },
          { placeholder: true, title: "Becoming a product", note: "A line or two on turning it into something you shipped." },
        ],
        figure: "tools",
        text: "What started as learning how to build simple tools gradually turned into full products used by real people.",
      },
      {
        stops: [4],
        moments: [
          { placeholder: true, title: "Design and code, together", note: "A line or two on when the two stopped being separate jobs." },
          { placeholder: true, title: "How you work now", note: "A line or two on the approach you bring to a product today." },
          { placeholder: true, title: "What comes next", note: "A line or two on the kind of work or team you want next." },
        ],
        figure: "venn",
        text: "The part I enjoyed most wasn’t only writing code. It was taking an idea, understanding the problem, designing the experience, building the system and turning it into something people could actually use — which is what pushed me toward design engineering and full-stack product development.",
      },
    ],
  },

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
    "Python",
    "Tailwind CSS",
    "PostgreSQL",
    "Neon",
    "Prisma",
    "Clerk",
    "NextAuth",
    "Redis",
    "Vercel",
    "AWS",
    "Google Cloud",
    "Azure",
    "Cloudflare",
    "Docker",
    "Kubernetes",
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
