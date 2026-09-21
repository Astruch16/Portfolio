/**
 * The build log — a public engineering journal, entirely data-driven.
 *
 * Add an entry by appending to `buildLog` (newest first is not required; the
 * page sorts by date). Nothing here is hardcoded in components. Every entry is
 * real work already done in this portfolio; no invented bugs, metrics or tech.
 *
 * DATES are editable placeholders within the real build month (August 2026) —
 * this work all landed recently; adjust each `date` to the actual day it shipped
 * if you want finer precision. Do not add months that didn't happen.
 */

export type BuildLogType =
  | "ship"
  | "build"
  | "fix"
  | "learn"
  | "experiment"
  | "decision";

export type BuildLogEntry = {
  /** Unique + URL-safe, so a future /build-log/[slug] can reuse it. */
  id: string;
  /** ISO date, YYYY-MM-DD. Drives ordering and month grouping. */
  date: string;
  project?: string;
  type: BuildLogType;
  title: string;
  summary: string;
  details?: string[];
  technologies?: string[];
  status?: string;
  /** Internal route or external URL. */
  link?: string;
  /** One entry may be featured and rendered larger. */
  featured?: boolean;
  /** Optional snippet — only where code genuinely explains the lesson. */
  code?: { language?: string; content: string };
};

export const buildLog: BuildLogEntry[] = [
  {
    id: "terminal-numbering",
    date: "2026-09-21",
    project: "Portfolio",
    type: "fix",
    title: "The one tab that lost its numbers",
    summary:
      "Every stack tab in the hero terminal was numbered — until the infrastructure tab grew past the point where the numbered layout fits.",
    details: [
      "The terminal lays a tab out for the rows the hero leaves it: numbered headings when there's room, a compact table when there isn't.",
      "The table carried no numbers, so a ten-entry tab always read differently from the rest.",
      "The table now numbers each entry on its first line too, so a tab reads the same whichever layout the height allows.",
    ],
    technologies: ["React", "TypeScript"],
    link: "/",
  },
  {
    id: "stack-lists",
    date: "2026-09-21",
    project: "Portfolio",
    type: "decision",
    title: "Stack lists that name languages and platforms, not libraries",
    summary:
      "shadcn/ui came out of every stack list on the site, and the languages, platforms and infrastructure I work with went in.",
    details: [
      "shadcn/ui is a component library — it doesn't sit beside a language or a platform — so it left the hero terminal, the about toolkit, Expird's stack and two case studies.",
      "Python joins the backend; Redis sits with the databases.",
      "AWS, Google Cloud, Azure, Cloudflare, Docker and Kubernetes join the infrastructure tab, each with a line of the command it's used through.",
      "None of them was added to a project's stack: the lists say what I use, the projects say what each one is built with.",
    ],
    technologies: ["Python", "Redis", "AWS", "Google Cloud", "Azure", "Cloudflare", "Docker", "Kubernetes"],
    link: "/about",
  },
  {
    id: "contact-closing-band",
    date: "2026-09-21",
    project: "Portfolio",
    type: "build",
    title: "Closed the contact page on something to look at",
    summary:
      "Four small readings and two buttons in a band that was mostly space became tiles and two panels that say what's behind them.",
    details: [
      "Status, place, local time and reply time set as tiles at a size worth reading.",
      "The two ways on show what they lead to — every project by name, and the latest build log entry.",
      "Both are counted from the data, so neither can go stale when a project or an entry is added.",
    ],
    technologies: ["Next.js", "Tailwind CSS"],
    link: "/contact",
  },
  {
    id: "about-hero-contrast",
    date: "2026-09-21",
    project: "Portfolio",
    type: "fix",
    title: "Clear ground for the about page's headline",
    summary:
      "The contour map behind the opening is drawn in code symbols about the size of the small type — and under the headline, it read straight through it.",
    details: [
      "A soft pool of the page's own ground now sits behind the headline block, so the map thins out under the words rather than behind a panel.",
      "The lead and the margin note step up a tone.",
      "The headline lost its full stop.",
    ],
    technologies: ["CSS"],
    link: "/about",
  },
  {
    id: "site-footer",
    date: "2026-09-16",
    project: "Portfolio",
    type: "build",
    title: "Gave every page a footer",
    summary:
      "Only the homepage had one; every other page simply stopped. It now closes the whole site from the root layout.",
    details: [
      "Every page, every project and the confirmed channel one press away, with the current page marked.",
      "Status, place and local time, for anyone about to write.",
      "The monogram runs the width of the page as an outline and fills with light wherever the pointer passes, driven by CSS variables rather than React state.",
      "The invitation to get in touch steps aside on the two pages that already end on one.",
    ],
    technologies: ["Next.js", "CSS masks", "Motion"],
    link: "/",
  },
  {
    id: "build-log-redesign",
    date: "2026-09-15",
    project: "Portfolio",
    type: "build",
    title: "Made this log something to read through",
    summary:
      "Every entry printed in full, one after another. Now each collapses to its headline, and the log can be searched, filtered, or reached a day at a time.",
    details: [
      "An activity strip draws a cell for every day from the entries' own dates, lit in the colour of what was done, and jumps to the day pressed.",
      "Search across titles, summaries, details and technologies, with the slash key to focus it from anywhere on the page.",
      "Each entry opens in place, with a real disclosure button, so the keyboard gets the same log the pointer does.",
    ],
    technologies: ["React", "Motion", "TypeScript"],
    link: "/build-log",
  },
  {
    id: "work-archive",
    date: "2026-09-15",
    project: "Portfolio",
    type: "build",
    title: "Turned the work page into an archive you can use",
    summary:
      "Five fixed blocks became a filterable set with two ways to read it, and the screenshots moved onto the cursor.",
    details: [
      "Filters counted from the project data rather than written as copy.",
      "An index view: a line per project, with the case study's screenshot riding the cursor and the rest of the set dimmed.",
      "A plates view: the screenshots take the page in a staggered sheet.",
      "Keyboard focus dims the set the same way, but never raises a preview it cannot place.",
    ],
    technologies: ["Motion", "Next.js Image", "TypeScript"],
    link: "/work",
  },
  {
    id: "contact-uplink",
    date: "2026-09-15",
    project: "Portfolio",
    type: "build",
    title: "Made the contact page answer the person writing",
    summary:
      "A carrier wave under the headline and a dish in the panel, both fed by the same keystrokes as the form.",
    details: [
      "A tiny store carries keystrokes and draft state to two canvases; neither re-renders React.",
      "Every character typed launches a packet that the dish absorbs and rings for.",
      "A signal meter reads one bar per field, so filling the form reads as bringing a channel up.",
      "Both canvases pause off screen and draw a single still frame under reduced motion.",
    ],
    technologies: ["Canvas", "React", "TypeScript"],
    link: "/contact",
  },
  {
    id: "contact-topic-reset",
    date: "2026-09-15",
    project: "Portfolio",
    type: "fix",
    title: "The one field a rejected submission kept losing",
    summary:
      "Every typed field survived a failed send. The topic select quietly did not.",
    details: [
      "React resets an uncontrolled form once its action settles.",
      "The select answered that reset by reporting its value as undefined, so the choice was thrown away while the text fields were restored from the action's own values.",
      "Controlling it — and falling back to what the action hands back — keeps the choice through a rejection.",
    ],
    technologies: ["React", "Server Actions", "Radix UI"],
    link: "/contact",
  },
  {
    id: "home-chapters",
    date: "2026-09-15",
    project: "Portfolio",
    type: "build",
    title: "Rebuilt the homepage under the hero as four chapters",
    summary:
      "The page used to end after five project rows. It now runs work, disciplines, the build log and contact, with a rail that tracks them.",
    details: [
      "A pinned stage holds whichever project is being read, its screenshots wiping in and drifting as the page moves.",
      "The light behind the stage takes the project's own colour.",
      "Disciplines open as panels that draw their figure; the toolkit runs past in two bands.",
      "A chapter rail drawn in mix-blend-difference reads on both the cream and the dark chapters without tracking which is underneath.",
    ],
    technologies: ["Motion", "Canvas", "Next.js"],
    link: "/",
    featured: true,
  },
  {
    id: "hero-terminal",
    date: "2026-09-15",
    project: "Portfolio",
    type: "build",
    title: "Put the stack and the prompt in one terminal",
    summary:
      "Two thin strips and an empty gap became a window that fills whatever height the hero leaves it.",
    details: [
      "A tab per stack category, plus the session the commands answer in.",
      "The body counts the rows that fit and lays the listing out for them — spaced headings on a tall screen, a line of names on a short one.",
      "Where even that won't fit, the full listing opens as a panel while the terminal is in use.",
    ],
    technologies: ["React", "ResizeObserver", "Tailwind CSS"],
    link: "/",
  },
  {
    id: "hero-statement-live",
    date: "2026-09-15",
    project: "Portfolio",
    type: "build",
    title: "One live line instead of three fixed ones",
    summary:
      "\"I design it / I build it / I ship it\" said its piece once and then sat there. Now the verb is whatever the sculpture is holding.",
    details: [
      "The verb decodes through the same code symbols the name is built from.",
      "A rail of all six forms doubles as the control, each carrying a bar that fills for exactly as long as that form holds.",
      "The bar and the cycle read the same two numbers, so they can't disagree.",
      "Set in the mono face the terminal and the rail use, which also stopped the verb jittering in width as it decodes.",
    ],
    technologies: ["React", "requestAnimationFrame", "TypeScript"],
    link: "/",
  },
  {
    id: "sculpture-context-loss",
    date: "2026-09-14",
    project: "Portfolio",
    type: "fix",
    title: "The sculpture that never came back",
    summary:
      "Three of the six forms looked broken. The renderer had lost its WebGL context and nothing ever asked for another.",
    details: [
      "A GPU reset, too many live contexts, a backgrounded tab — or, in development, any hot reload — drops the context.",
      "The canvas stays on the page and simply never draws again.",
      "Listening for webglcontextlost and remounting the canvas brings it back; verified by forcing a loss through WEBGL_lose_context.",
    ],
    technologies: ["React Three Fiber", "WebGL"],
    link: "/",
  },
  {
    id: "hero-sculpture",
    date: "2026-09-14",
    project: "Portfolio",
    type: "build",
    title: "Replaced the laptop with a particle sculpture",
    summary:
      "A few thousand points holding six forms — design, build, ship, code, measure, iterate — morphing between them in one draw call.",
    details: [
      "Every particle carries its position in all six forms as attributes; one shader blends them by six weights.",
      "The pointer is handled in screen space inside the same shader, so a push is the same size at any depth.",
      "Drawn in ink on the cream page rather than as glowing points: additive glow disappears on paper.",
      "A flat canvas version draws the same forms for phones and reduced motion, and never downloads three.js.",
    ],
    technologies: ["React Three Fiber", "GLSL", "Canvas"],
    link: "/",
  },
  {
    id: "about-redesign",
    date: "2026-09-13",
    project: "Portfolio",
    type: "build",
    title: "Rebuilt the about page as a route in",
    summary:
      "Hydrogeology to design engineering, told as chapters on a rail rather than as a wall of paragraphs.",
    details: [
      "Each chapter carries its own technical figure, drawn rather than illustrated.",
      "Scroll-played moments sit under each chapter, with placeholders where the real ones are still owed.",
      "The opening's topographic map is drawn entirely in tiny code symbols — marching squares, one symbol per contour crossing.",
      "The portrait came out at Adam's request; the page holds without it.",
    ],
    technologies: ["Canvas", "Motion", "IntersectionObserver"],
    link: "/about",
  },
  {
    id: "contact-form-privacy",
    date: "2026-09-08",
    project: "Portfolio",
    type: "decision",
    title: "Took my email address off the site",
    summary:
      "A published address is scraped within days. The page now carries a form, and the mailbox lives in server configuration.",
    details: [
      "Submits through a Server Action, so it still works with JavaScript disabled.",
      "A honeypot field and a timing check reject the obvious bots without a captcha.",
      "The destination address never reaches the client bundle, this repository, or a scraper reading the page.",
    ],
    technologies: ["Server Actions", "Resend", "TypeScript"],
    link: "/contact",
  },
  {
    id: "reduced-motion-hydration",
    date: "2026-08-21",
    project: "Portfolio",
    type: "fix",
    title: "Reduced motion, without the hydration mismatch",
    summary:
      "Branching on the motion preference during render made the server and client disagree.",
    details: [
      "useReducedMotion() at render time produced different markup on the server than the client.",
      "Centralizing the preference through a single MotionConfig removed the branch entirely.",
      "Components now render identical markup; Motion drops the travel and keeps the fade for users who ask for it.",
    ],
    technologies: ["Motion"],
    code: {
      language: "tsx",
      content:
        '// one place decides — markup stays identical on server + client\n<MotionConfig reducedMotion="user">\n  {children}\n</MotionConfig>',
    },
  },
  {
    id: "mask-reveal-observer",
    date: "2026-08-20",
    project: "Portfolio",
    type: "fix",
    title: "The reveal that never revealed",
    summary:
      "Masked headings sometimes stayed hidden — the scroll observer was watching the wrong element.",
    details: [
      "The observer targeted the animated element itself.",
      "It began clipped by an overflow-hidden mask, so its transformed position could never intersect the viewport — and the reveal never fired.",
      "Moving the observer onto the clipping wrapper and passing the state down fixed it.",
    ],
    technologies: ["Motion", "IntersectionObserver"],
    code: {
      language: "tsx",
      content:
        '// observe the clipping wrapper, not the element that moves\n<span className="mask-line">        {/* overflow: hidden */}\n  <motion.span whileInView="visible" viewport={{ once: true }}>\n    {children}                {/* slides up from behind the mask */}\n  </motion.span>\n</span>',
    },
  },
  {
    id: "portfolio-hero-performance",
    date: "2026-08-20",
    project: "Portfolio",
    type: "build",
    title: "Kept Three.js off the critical path",
    summary:
      "Optimized the 3D hero so the engine never loads for the people who don't need it.",
    details: [
      "Three.js isn't loaded on mobile or under reduced motion.",
      "The canvas parks when it scrolls offscreen.",
      "Pointer work never triggers a React render per frame.",
    ],
    technologies: ["React Three Fiber", "Motion"],
    link: "/",
  },
  {
    id: "portfolio-hero-system",
    date: "2026-08-19",
    project: "Portfolio",
    type: "build",
    title: "Rebuilt the hero around a live 3D dev scene",
    summary:
      "An editorial hero built with Next.js, Motion and React Three Fiber — a terminal-style boot sequence over a 3D laptop scene, with fallbacks the whole way down.",
    details: [
      "Terminal-style boot sequence",
      "R3F laptop scene (placeholder model — final GLB pending)",
      "Live terminal texture rendered onto the screen",
      "Reduced-motion fallback",
      "Mobile CSS fallback with no Three.js",
      "Stationary 3D scene — no cursor-following",
      "Technical paper / grid background",
    ],
    technologies: ["Next.js", "React Three Fiber", "Motion", "TypeScript"],
    link: "/",
  },
  {
    id: "mintlytics-case-study",
    date: "2026-08-18",
    project: "Mintlytics",
    type: "ship",
    title: "Shipped the Mintlytics case study",
    summary:
      "A data-heavy market-intelligence platform for the Pokémon TCG, documented end to end.",
    details: [
      "External APIs and scraping",
      "Scheduled jobs within rate limits",
      "A historical pricing store",
      "User-defined price alerts",
      "Building an internal pricing database rather than renting one",
    ],
    technologies: ["Next.js", "Prisma", "PostgreSQL / Neon"],
    link: "/work/mintlytics",
  },
  {
    id: "my-local-loop-case-study",
    date: "2026-08-17",
    project: "My Local Loop",
    type: "ship",
    title: "Shipped the My Local Loop case study",
    summary:
      "A two-sided local-commerce marketplace, documented across both sides of the product.",
    details: [
      "Local and Partner product flows",
      "QR + manual-code redemption",
      "Role-based access control",
      "The marketplace loop that ties supply and demand together",
    ],
    technologies: ["Next.js", "Prisma", "Clerk", "Stripe"],
    link: "/work/my-local-loop",
  },
  {
    id: "case-study-system",
    date: "2026-08-16",
    project: "Expird",
    type: "build",
    title: "Built a reusable case-study system",
    summary:
      "The first project case study, and the data-driven system every case study now runs on.",
    details: [
      "Data-driven chapters and blocks",
      "The ProductExhibit plate system",
      "Responsive screenshot handling",
      "Technical architecture visuals",
      "Mobile pannable product screenshots",
    ],
    technologies: ["Next.js", "TypeScript"],
    link: "/work/expird",
  },
];

/** Projects in active development, for the "Currently building" rail. */
export const currentlyBuilding: {
  name: string;
  slug?: string;
  focus: string[];
  status: string;
}[] = [
  {
    name: "Expird",
    slug: "expird",
    focus: ["Closed-beta refinement", "Mobile planning", "Bug fixes"],
    status: "Active",
  },
  {
    name: "My Local Loop",
    slug: "my-local-loop",
    focus: ["Partner onboarding", "Mobile improvements", "Beta hardening"],
    status: "Active",
  },
  {
    name: "Mintlytics",
    slug: "mintlytics",
    focus: ["Building internal pricing history", "Closed-beta data maturity"],
    status: "Active",
  },
  {
    name: "Portfolio",
    focus: ["Interactive hero", "Homepage chapters", "Work archive & build log"],
    status: "Active",
  },
];

/** Topics actively being learned — grounded in the work above, not a rating. */
export const currentlyLearning: string[] = [
  "WebGL / R3F",
  "System design",
  "Background jobs",
  "Data pipelines",
];
