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
    featured: true,
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
    focus: ["Case-study system", "Work, About & Build Log pages"],
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
