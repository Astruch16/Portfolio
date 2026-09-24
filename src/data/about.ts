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
   * `moments` are three beats under each chapter: a heading, what happened,
   * and a plate beside it. The first chapter's are Adam's own words; the rest
   * are still PLACEHOLDER prompts, marked as such. Replace the title and note
   * with the real moment and drop `placeholder` — the tag disappears with it.
   *
   * The plate takes a photograph (`image`, a file in /public) if there is one.
   * Where there never was one — nobody photographed a groundwater model — `art`
   * names a drawing instead, in the same line language as the chapter figures.
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
          {
            title: "Where it began",
            note: "I came to hydrogeology after two years of engineering at Thompson Rivers University. The field pulled me in because it had all of it at once \u2014 mathematics, physics, modelling and system dynamics. Finishing the degree meant transferring to Simon Fraser University in Burnaby for the final four years, and it was there, in 2017, that I wrote code and thought about system design for the first time.",
            art: "cross-section",
          },
          {
            title: "What the work taught",
            note: "It was a rigorous program, split between the field and the lecture hall. It taught me how to work systems I could only measure indirectly, how to model them, and how to manage my own time. The problems were things like the sustainability of aquifer systems, the geochemistry of groundwater and petroleum, and computing flow values through one program after another.",
            art: "field-sheet",
          },
          {
            title: "The move away",
            note: "Once I had learned to code, I was hooked \u2014 but I was years into the degree and close to the end, so I saw it through, even knowing I didn\u2019t want that career. I\u2019ve always been entrepreneurial, so when COVID hit I got my real estate licence, and I\u2019ve been practising for six years since, building and coding the whole way through. Now it\u2019s time to go at what I actually love, full force.",
            art: "crossover",
          },
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
    "ESLint",
    "Prettier",
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
