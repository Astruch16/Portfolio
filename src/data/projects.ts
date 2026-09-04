/**
 * The five projects, and the only place their content lives.
 *
 * Several fields are deliberately null or empty: Adam has not supplied the
 * positioning copy, confirmed stacks, statuses or brand colours yet, and this
 * file must never carry invented ones. The section renders a marked placeholder
 * wherever a value is missing, so what is real and what is pending stays
 * obvious both in the code and on the page.
 *
 * To fill one in: write the value here. To retire a placeholder visual: drop a
 * file in /public and set `image`.
 */

export type ProjectStatus =
  | "Live"
  | "Closed beta"
  | "In development"
  | "Building";

export type ProjectVisual =
  | "map"
  | "commerce"
  | "chart"
  | "property"
  | "cinematic";

/** How the row is composed. `full` lets the visual carry the whole width. */
export type ProjectLayout = "right" | "left" | "full";

/**
 * A project's stack, grouped by the layer each piece belongs to.
 *
 * Grouped rather than flat because a single run of eight names reads as one
 * undifferentiated string; three short columns say what the product is made of
 * and where each piece sits. Every layer is optional — an empty array simply
 * drops that column.
 */
export type ProjectStack = {
  frontend: string[];
  backend: string[];
  infrastructure: string[];
};

/** Used by every project whose stack Adam has not confirmed yet. */
const STACK_PENDING: ProjectStack = {
  frontend: [],
  backend: [],
  infrastructure: [],
};

export type Project = {
  slug: string;
  index: string;
  name: string;
  /** Small category label above the name. */
  kind: string;
  /** The discipline line under the name. */
  discipline: string;
  /** Positioning statement — null until real copy is provided. */
  statement: string | null;
  /** Every layer empty until the stack is confirmed. */
  stack: ProjectStack;
  /** Null until confirmed. */
  status: ProjectStatus | null;
  /**
   * PLACEHOLDER accents, chosen only to keep the five rows distinguishable.
   * Replace each with the product's actual brand colour.
   */
  accent: string;
  /**
   * Optional two-stop wordmark gradient for the case-study title. Falls back to
   * the flat `accent` when absent.
   */
  accentGradient?: [string, string];
  visual: ProjectVisual;
  layout: ProjectLayout;
  /** Set this and the placeholder composition is replaced by the real asset. */
  image?: string;
  url?: string;
  github?: string;
  /** Never populate without real figures. */
  metrics?: { value: string; label: string }[];
};

export const projects: Project[] = [
  {
    slug: "expird",
    index: "01",
    name: "Expird",
    kind: "Product",
    discipline: "Real Estate Intelligence / Agent Productivity",
    statement:
      "Real estate software for discovering, tracking and converting expired listing opportunities.",
    // The eight names are Adam's; which layer each sits in is a reading of
    // what the tool does, so move any of them if a line lands wrong.
    stack: {
      frontend: ["Next.js", "React", "TypeScript", "shadcn/ui"],
      backend: ["Neon", "Prisma", "Clerk"],
      infrastructure: ["Vercel"],
    },
    status: "Closed beta",
    // Read from the Expird wordmark. Swap in the exact brand values if off.
    accent: "#4c6ef5",
    accentGradient: ["#5da2f5", "#4353e6"],
    visual: "map",
    layout: "right",
  },
  {
    slug: "my-local-loop",
    index: "02",
    name: "My Local Loop",
    kind: "Product",
    discipline: "Two-Sided Marketplace / Local Commerce",
    statement:
      "A two-sided local commerce marketplace where businesses join by giving exclusive offers, not paying marketing fees, and residents subscribe to discover and redeem them.",
    stack: {
      frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      backend: ["PostgreSQL / Neon", "Prisma", "Clerk", "Stripe", "Zod"],
      infrastructure: ["Upstash Redis", "Vercel"],
    },
    status: "Closed beta",
    // The product's own identity: forest green into warm gold.
    accent: "#2d4a3e",
    accentGradient: ["#2d4a3e", "#9c7a3c"],
    visual: "commerce",
    layout: "left",
  },
  {
    slug: "mintlytics",
    index: "03",
    name: "Mintlytics",
    kind: "Product",
    discipline: "Collectibles Market Intelligence / Pokémon TCG",
    statement:
      "A Pokémon TCG market-intelligence platform combining pricing history, portfolio tracking, alerts, market signals, eBay deal discovery and collector tools in one interface.",
    stack: {
      frontend: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Recharts"],
      backend: ["Prisma 7", "PostgreSQL / Neon", "NextAuth", "Node 20"],
      infrastructure: ["Vercel", "Vercel Cron"],
    },
    status: "Closed beta",
    // A market-terminal signature: cyan signal into violet.
    accent: "#22d3ee",
    accentGradient: ["#22d3ee", "#8b5cf6"],
    visual: "chart",
    layout: "right",
  },
  {
    slug: "truhost",
    index: "04",
    name: "TruHost",
    kind: "Product",
    discipline: "Hospitality Software",
    statement: null,
    stack: STACK_PENDING,
    status: null,
    accent: "#c9a227",
    visual: "property",
    layout: "left",
  },
  {
    slug: "fighting-kiwi",
    index: "05",
    name: "Fighting Kiwi",
    kind: "Studio",
    discipline: "Film & Photography",
    statement: null,
    stack: STACK_PENDING,
    status: null,
    accent: "#e8e8ea",
    visual: "cinematic",
    layout: "full",
  },
];

/** The whole stack as one ordered run, for contexts with a single line to give. */
export function stackList(stack: ProjectStack): string[] {
  return [...stack.frontend, ...stack.backend, ...stack.infrastructure];
}

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
