import type { ProjectVisual } from "@/data/projects";

/**
 * Long-form case studies, keyed by project slug.
 *
 * A study is an ordered list of chapters, and a chapter is an ordered list of
 * blocks. Every block type has one renderer, so writing a new case study is a
 * data exercise: no chapter needs a bespoke component, and reordering or
 * dropping a block never touches layout code.
 *
 * Nothing in here may be invented. Where Adam has not supplied content the
 * value stays empty and the page renders a marked pending block that also
 * states what belongs there.
 */

export type CaseVisual = {
  /** Set `src` (with its intrinsic size) and the placeholder composition
   *  retires, and the frame becomes a product exhibit. */
  src?: string;
  /** Intrinsic pixel size. Required alongside `src`: the plate holds the
   *  screen's own ratio rather than forcing it into a slot and cropping it. */
  width?: number;
  height?: number;
  alt?: string;
  /** Two-part mono rail stamp, e.g. ["Feature", "Map view"]. */
  rail?: [string, string];
  /**
   * Where the narrow-viewport pan window opens. An app shell wants its sidebar
   * (`left`, the default); a centred marketing or onboarding layout would
   * otherwise open on empty canvas and needs `center`.
   */
  focus?: "left" | "center";
  /** Shown above the frame in a gallery. */
  title?: string;
  caption?: string | null;
  composition?: ProjectVisual;
  aspect?: "16/9" | "4/3" | "3/2" | "21/9";
};

export type CaseMetric = {
  /** Null until the real figure exists. Never estimate. */
  value: string | null;
  label: string;
};

export type CaseBlock =
  | { type: "paragraphs"; items: string[] }
  /** A pulled-out statement carrying more weight than body copy. */
  | { type: "emphasis"; lines: string[] }
  /** An inline arrow-separated sequence, e.g. a workflow. */
  | { type: "steps"; items: string[] }
  /** Numbered editorial decisions. */
  | { type: "decisions"; label: string; items: string[] }
  /** The animated data pipeline. */
  | { type: "architecture"; nodes: { label: string; note: string }[] }
  /** Label → value transformation rows. */
  | { type: "transform"; rows: { label: string; value: string }[] }
  | { type: "gallery"; visuals: CaseVisual[] }
  | { type: "metrics"; metrics: CaseMetric[] }
  | { type: "list"; items: { title: string; body: string }[] }
  /** A full-width typographic moment. */
  | { type: "statement"; lines: string[] }
  /** Signature circular flywheel (My Local Loop). */
  | { type: "loop"; hub: string; stages: { label: string; note: string }[] }
  /** The redemption architecture: one identity, two presentations, one chain. */
  | {
      type: "flow";
      source: { label: string; note?: string };
      branches: { label: string; note?: string }[];
      chain: { label: string; note?: string }[];
    }
  /** Two mirrored columns — the Local and the Partner. */
  | {
      type: "mirror";
      sides: [
        { tag: [string, string]; title: string; items: string[] },
        { tag: [string, string]; title: string; items: string[] },
      ];
    }
  /** The two-sided technical architecture, forking at top and bottom. */
  | {
      type: "stack";
      entries: { label: string; note: string }[];
      core: { label: string; note: string }[];
      infra: { label: string; note: string }[];
      data: { label: string; note: string };
      systems: string[];
    }
  /** A compact specimen of the product's visual system. */
  | { type: "specimen"; swatches: { name: string; value: string }[] }
  /** Signature data-ingestion terminal (Mintlytics): sources → layer → surfaces. */
  | {
      type: "terminal";
      hub: string;
      sources: { label: string; note?: string }[];
      features: string[];
    }
  /** The animated data-ingestion pipeline (Mintlytics). */
  | {
      type: "ingestion";
      sources: string[];
      stages: { label: string; note?: string }[];
      features: string[];
    }
  /** The Mintlytics dark market-terminal specimen. */
  | { type: "mint-specimen"; swatches: { name: string; value: string }[] }
  /** A grouped tech-stack spec sheet. */
  | { type: "techstack"; groups: { label: string; items: string[] }[] };

export type CaseSection =
  | {
      kind: "chapter";
      id: string;
      index: string;
      label: string;
      headline?: string;
      /** What belongs here, shown beside the pending marker. */
      prompt: string;
      blocks: CaseBlock[];
    }
  /** A pacing break. Full width, unnumbered, no rail. */
  | { kind: "interlude"; id: string; lines: string[]; note: string[] }
  /**
   * A product screen given its own moment between chapters.
   *
   * Its own section rather than a block inside one, for two reasons: it can
   * run wider than the text column without fighting the 12-column rail, and
   * putting it between two dense chapters is what stops the page from becoming
   * an unbroken run of prose.
   *
   * `bleed` runs it to the viewport edges, `shell` to the page margin, `inset`
   * holds it back to roughly the text measure — for a screen that is supporting
   * evidence rather than the subject.
   */
  | {
      kind: "exhibit";
      id: string;
      visual: CaseVisual;
      scale: "inset" | "shell" | "bleed";
    }
  /**
   * A product screen paired with a margin-note column — for a screen that only
   * warrants inset width, so the otherwise-empty right side annotates it instead.
   */
  | {
      kind: "aside";
      id: string;
      visual: CaseVisual;
      heading: string;
      notes: { label: string; body: string }[];
    };

export type CaseStudy = {
  slug: string;
  summary: string | null;
  role: string[];
  timeline: string | null;
  /** Rendered as a link when it looks like a URL, otherwise as plain text. */
  live: string | null;
  hero: CaseVisual;
  sections: CaseSection[];
};

export const caseStudies: Record<string, CaseStudy> = {
  expird: {
    slug: "expird",
    summary:
      "Real estate software for discovering, tracking and converting expired listing opportunities.",
    role: ["Founder", "Product Designer", "Full-Stack Developer"],
    timeline: "Active development",
    live: "Private beta",
    hero: {
      src: "/work/expird/dashboard.png",
      width: 1905,
      height: 952,
      rail: ["Product", "Dashboard"],
      alt: "The Expird dashboard: counts for expired, terminated, sent-out and back-to-active listings, a quick-actions column, a listings map and a week-over-week expired-listings chart.",
      caption:
        "Dashboard — listing counts, quick actions, the listings map and the week-over-week expiry trend.",
    },
    sections: [
      {
        kind: "chapter",
        id: "problem",
        index: "01",
        label: "The Problem",
        headline: "A valuable part of the market was being forgotten.",
        prompt: "What was broken, who it was broken for, and why it mattered.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Expired listings can represent a significant source of potential business for real estate agents, but the workflow around them is fragmented.",
              "As an agent myself, I was manually tracking properties that had expired, recording which owners I had contacted, keeping notes, and trying to remember when I needed to follow up.",
            ],
          },
          {
            type: "emphasis",
            lines: [
              "The problem wasn't finding a single expired listing.",
              "The problem was managing hundreds of opportunities over time.",
            ],
          },
          {
            type: "paragraphs",
            items: [
              "Without a dedicated system, listings get forgotten, follow-ups are missed, and it becomes difficult to understand which properties are actually worth pursuing.",
              "I wanted one place where that entire workflow could live.",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "idea",
        index: "02",
        label: "The Idea",
        headline:
          "I wasn't trying to build a product. I was trying to solve my own problem.",
        prompt: "How the solution was arrived at, and what was ruled out.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Expird started as a tool for my own real estate business. I was actively targeting expired listings but couldn't find a system that was both purpose-built for the workflow and simple enough to use every day. So I started building my own.",
              "The first version was simply about organization. But once the core system existed, I realized the opportunity was much larger.",
              "Instead of another generic real estate CRM, Expird could become a platform specifically designed around the lifecycle of an expired listing.",
            ],
          },
          {
            type: "steps",
            items: [
              "Import",
              "Discover",
              "Prioritize",
              "Contact",
              "Follow up",
              "Track",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-public",
        // Supporting evidence for the positioning, not a product screen in its
        // own right — held back so it never out-scales the app exhibits.
        scale: "inset",
        visual: {
          src: "/work/expird/overview.png",
          width: 1915,
          height: 1227,
          rail: ["Public", "Product site"],
          focus: "center",
          alt: "The public Expird site, headed “Turn Expired Listings Into Closed Deals”, with the dashboard shown beneath it.",
          caption:
            "The public site — the outward positioning: tracking, managing and converting expired and terminated MLS listings.",
        },
      },
      {
        kind: "interlude",
        id: "tool-to-product",
        lines: [
          "I built it for myself.",
          "Then I realized I wasn't",
          "the only one with the problem.",
        ],
        note: ["Personal tool", "Closed beta", "10 testers", "Next: brokerage"],
      },
      {
        kind: "chapter",
        id: "design",
        index: "03",
        label: "The Design",
        headline:
          "Powerful enough to be useful. Simple enough to actually be used.",
        prompt: "The interface and interaction decisions, and their reasoning.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Real estate agents span a huge range of technical ability. That became one of the most important design constraints in Expird.",
              "The interface needed to provide mapping, property data, ranking, follow-ups, notes and performance tracking without making the product feel complicated. I focused on reducing the number of steps required to complete common actions and keeping the hierarchy predictable throughout the application.",
              "Early testing exposed an important problem: some agents immediately understood the interface, while others found parts of it difficult to navigate. That changed the way I approached the product.",
              "Instead of designing around what I thought was intuitive, I began designing around what different users actually needed.",
            ],
          },
          {
            type: "decisions",
            label: "Decisions",
            items: [
              "Prioritize common actions over feature density",
              "Keep workflows short and predictable",
              "Allow agents to customize what they track",
              "Design for different levels of technical confidence",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-onboarding",
        scale: "shell",
        visual: {
          src: "/work/expird/welcome.png",
          width: 1885,
          height: 942,
          rail: ["Onboarding", "First run"],
          focus: "center",
          alt: "Expird’s welcome screen, introducing track listings, pipeline view, interactive map, outreach tracking, follow-ups and analytics, with a guided tour offered.",
          caption:
            "First run — the six things an agent can do, stated plainly, with the guided tour offered rather than imposed.",
        },
      },
      {
        kind: "chapter",
        id: "build",
        index: "04",
        label: "The Build",
        headline:
          "A full-stack product built around an unusual data constraint.",
        prompt: "How the system is actually put together, end to end.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Expird is built with Next.js, React, TypeScript, Neon, Prisma, Clerk, shadcn/ui and Vercel.",
              "The application handles authentication, user-specific listing data, CSV ingestion, property management, follow-up workflows, notes, mapping and performance tracking.",
              "One of my biggest technical learning curves was building the data layer with Prisma and Neon. It was my first project using Neon and my first time connecting the database architecture through Prisma at this scale. Building Expird forced me to think beyond individual UI components and understand how data moves through an entire application.",
            ],
          },
          {
            type: "architecture",
            nodes: [
              { label: "CSV import", note: "ingest" },
              { label: "Validation / parsing", note: "transform" },
              { label: "Prisma", note: "data layer" },
              { label: "Neon database", note: "storage" },
              { label: "User listings", note: "records" },
              { label: "Map / ranking / follow-ups", note: "surfaces" },
              { label: "Agent portal", note: "client" },
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-map",
        scale: "bleed",
        visual: {
          src: "/work/expird/map-view.png",
          width: 1907,
          height: 942,
          rail: ["Feature", "Map view"],
          alt: "Expird’s map view: imported listings plotted across Greater Vancouver, the Fraser Valley and Chilliwack, with board and type filters and an expired / terminated / active legend.",
          caption:
            "Map view — imported listings plotted across Greater Vancouver, the Fraser Valley and Chilliwack, filtered by board and type. The last node of the diagram above, running in the product.",
        },
      },
      {
        kind: "chapter",
        id: "challenge",
        index: "05",
        label: "The Challenge",
        headline: "The limitation that changed the product.",
        prompt: "The engineering problems that were genuinely hard to solve.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The original vision was full automation. The problem: I couldn't rely on an MLS API that provided the expired-listing data Expird needed.",
              "Initially, that felt like a major limitation. If Expird couldn't automatically pull every expired listing, the platform would have to depend on the agent supplying the data.",
              "Instead of abandoning the workflow, I redesigned it around bulk CSV ingestion. Agents can export the listings they want to work with and upload them directly into Expird. The platform parses the file and populates their workspace automatically.",
              "Unexpectedly, the limitation created an advantage. Rather than flooding an agent's account with every available expired listing, the agent controls exactly what enters their pipeline. Their workspace stays focused on the opportunities they've actually chosen to pursue.",
            ],
          },
          {
            type: "transform",
            rows: [
              { label: "Constraint", value: "No suitable MLS API" },
              { label: "Rethink", value: "Agent-controlled CSV import" },
              { label: "Result", value: "Focused dataset" },
              { label: "Product benefit", value: "Less noise / more control" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "product",
        index: "06",
        label: "In Product",
        prompt: "Screens from the running product.",
        blocks: [
          {
            type: "gallery",
            visuals: [
              {
                title: "Listing intelligence",
                caption:
                  "Properties prioritized using relevant surrounding listing and sales data.",
                composition: "map",
                aspect: "4/3",
              },
              {
                title: "Property detail",
                caption: "Property information, notes and contact history.",
                composition: "map",
                aspect: "4/3",
              },
              {
                title: "Follow-up system",
                caption: "Reminders for previously contacted properties.",
                composition: "map",
                aspect: "4/3",
              },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "result",
        index: "07",
        label: "The Result",
        headline: "From personal tool to closed beta.",
        prompt: "Real, verifiable outcomes only.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Expird is currently being tested in a controlled closed beta with 10 real estate professionals. I intentionally capped the initial group while I continue refining workflows, fixing issues and collecting feedback.",
              "The beta has already influenced the product — particularly around usability and how much complexity different agents are comfortable with.",
              "The next validation milestone is exploring a broader rollout through my brokerage once the product reaches the level of stability I'm looking for.",
            ],
          },
          {
            type: "metrics",
            metrics: [
              { value: "10", label: "Beta testers (capped)" },
              { value: "Closed", label: "Beta status" },
              { value: "1 → 10", label: "Personal tool → real users" },
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-analytics",
        scale: "shell",
        visual: {
          src: "/work/expird/analytics.png",
          width: 1911,
          height: 944,
          rail: ["System", "Analytics"],
          alt: "Expird’s analytics view: total listings, send rate, conversion rate and average per day, with listing activity over time and breakdowns by type, board and city.",
          caption:
            "Analytics — totals, send and conversion rates, listing activity over time, and distribution by board and city.",
        },
      },
      {
        kind: "chapter",
        id: "learned",
        index: "08",
        label: "What I Learned",
        headline: "Building the feature isn't the same as building the product.",
        prompt: "What building this actually taught you.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Expird changed how I think about software. Early on, I was focused heavily on what the product could do. I would build features based on what I believed agents needed and then show people the result.",
              "Testing it with other agents exposed the weakness in that approach. A feature can work perfectly and still be the wrong experience.",
              "Some users found workflows intuitive while others struggled with the same interactions. That taught me that design and engineering can't be separated — especially when you're building for users with very different levels of technical experience.",
              "If I started Expird again, I would involve users before building as much as I involved them after.",
            ],
          },
          {
            type: "statement",
            lines: ["Ask first.", "Prototype.", "Test.", "Then build."],
          },
        ],
      },
      {
        kind: "chapter",
        id: "next",
        index: "09",
        label: "What's Next",
        headline: "Expird isn't finished. It's being proven.",
        prompt: "Where the product goes from here.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Expird is currently in the final stages of development while the closed beta continues. The immediate focus is stability, improving workflows and incorporating feedback from the current group of testers.",
            ],
          },
          {
            type: "list",
            items: [
              {
                title: "Native / mobile experience",
                body: "Bring the workflow closer to agents while they're working in the field.",
              },
              {
                title: "Deeper MLS automation",
                body: "Continue exploring ways to reduce or eliminate manual data ingestion where access permits.",
              },
              {
                title: "Payments",
                body: "Integrate Stripe and establish the subscription infrastructure required for a public product.",
              },
              {
                title: "Expanded beta",
                body: "Move beyond the initial testing group and explore deployment across a larger brokerage environment.",
              },
            ],
          },
          {
            type: "statement",
            lines: [
              "The goal is no longer simply to build the tool I needed.",
              "It's to build the tool I wish existed when I started.",
            ],
          },
        ],
      },
    ],
  },

  "my-local-loop": {
    slug: "my-local-loop",
    summary:
      "A two-sided local commerce marketplace where businesses join by giving exclusive value, not paying marketing fees, and residents subscribe to discover and redeem it.",
    role: [
      "Product Design",
      "Full-Stack Development",
      "UX / UI",
      "Product Strategy",
    ],
    timeline: "Active development",
    live: "Closed beta",
    hero: {
      src: "/work/my-local-loop/landing.png",
      width: 1918,
      height: 1249,
      rail: ["Public", "Local commerce"],
      focus: "center",
      alt: "The My Local Loop landing page: a headline reading “The local deals you can’t get anywhere else”, a phone showing a personal QR Local Pass, and an “Our Local Partners” row of participating businesses.",
      caption:
        "The public site — local deals, the subscription, participating partners, the Local Pass and QR redemption, stated in a single view.",
    },
    sections: [
      {
        kind: "chapter",
        id: "problem",
        index: "01",
        label: "The Problem",
        headline: "Independent businesses compete against budgets they can't match.",
        prompt: "What was broken, who it was broken for, and why it mattered.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Independent local businesses increasingly compete against major chains, conglomerates and online retailers with marketing budgets they cannot realistically match.",
              "Traditional coupon systems don't solve this well. Most local businesses still lean on in-store promotions, social media, flyers, manually distributed coupons and printed coupon books.",
            ],
          },
          {
            type: "decisions",
            label: "Where the coupon book breaks",
            items: [
              "Businesses often pay just to participate",
              "Offers are static once printed",
              "A business may get only one or two placements",
              "Offers can't easily be changed",
              "Redemption is difficult to measure",
              "The customer has to carry a physical book",
              "Little connects a redemption to repeat behaviour",
            ],
          },
          {
            type: "emphasis",
            lines: [
              "What if the business didn't have to",
              "pay for the marketing platform at all?",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "idea",
        index: "02",
        label: "The Idea",
        headline: "So we flipped who pays — and what they pay with.",
        prompt: "How the solution was arrived at, and what was ruled out.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "My business partner and I had both watched independent “Mom & Pop” businesses struggle as consumer spending moved toward major chains, conglomerates and online retailers.",
              "We wanted something that could help local businesses generate traffic and repeat customers without another advertising expense. So the model was intentionally inverted. Consumers fund the platform through a subscription — $9.99 CAD a month today, planned to move to $14.99.",
            ],
          },
          {
            type: "emphasis",
            lines: [
              "Instead of the business paying the platform,",
              "the business pays with value.",
            ],
          },
          {
            type: "transform",
            rows: [
              {
                label: "Traditional",
                value: "Business pays the platform to advertise a discount",
              },
              {
                label: "My Local Loop",
                value: "Business gives exclusive value; the Local pays for access",
              },
              { label: "Partners contribute", value: "Exclusive offers" },
              { label: "Locals contribute", value: "A subscription" },
              { label: "The marketplace", value: "Connects the two" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "loop",
        index: "03",
        label: "The Marketplace Loop",
        headline: "Every redemption is a reason to make the next offer.",
        prompt: "The flywheel that gives the product its name.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "No side is paying the other in the usual sense. Partners contribute value, Locals contribute a subscription, and each completed redemption feeds the reason for the next one — which is what keeps the loop turning.",
            ],
          },
          {
            type: "loop",
            hub: "The Loop",
            stages: [
              { label: "Provide", note: "Partners post offers" },
              { label: "Discover", note: "Locals find value" },
              { label: "Visit", note: "The business" },
              { label: "Redeem", note: "The Local Pass" },
              { label: "Data", note: "Traffic + signal" },
              { label: "Create", note: "New offers" },
              { label: "Return", note: "The Local comes back" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "two-sided",
        index: "04",
        label: "Two Sides, One Product",
        headline: "One marketplace, built as two products that never overlap.",
        prompt: "The fundamental product architecture.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "My Local Loop is effectively two connected applications running against one marketplace: the Local, and the Partner. They mirror each other in structure and share almost nothing in permission.",
            ],
          },
          {
            type: "mirror",
            sides: [
              {
                tag: ["Local", "Demand"],
                title: "Subscribe, discover, redeem.",
                items: [
                  "Create an account and subscribe through Stripe",
                  "Browse active offers and participating businesses",
                  "See nearby businesses on a map",
                  "Search and filter deals",
                  "Track savings, coupon usage and frequent visits",
                  "Carry a Local Pass — a unique QR and manual code",
                ],
              },
              {
                tag: ["Partner", "Supply"],
                title: "Apply, get approved, go live.",
                items: [
                  "Submit a Partner Application with a proposed baseline offer",
                  "Get reviewed in the admin portal, then redeem an emailed key",
                  "Onboard — gated behind creating the baseline offer",
                  "Build offers: discounts, imagery, dates, limits",
                  "Track redemptions, repeat customers and revenue attributed",
                  "Manage the storefront and scan the Local Pass",
                ],
              },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "local",
        index: "05",
        label: "The Local Experience",
        headline: "The consumer product, at a glance.",
        prompt: "What the Local sees first.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Once onboarded, the Local enters a portal built to make value effortless to find. It leads with the number that matters to a subscriber — what they've saved — and surrounds it with active deals, nearby businesses, high-traffic hours and the newest offers.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-consumer-dashboard",
        scale: "shell",
        visual: {
          src: "/work/my-local-loop/consumer-dashboard.png",
          width: 2046,
          height: 1262,
          rail: ["Local", "Dashboard"],
          focus: "left",
          alt: "The Local dashboard: savings over the last 30 days, coupons used, active coupons and frequent visits, with places nearby, high-traffic hours and newest offers.",
          caption:
            "The Local dashboard — savings first, then active deals, nearby businesses, high-traffic hours and the newest offers.",
        },
      },
      {
        kind: "chapter",
        id: "design",
        index: "06",
        label: "The Design",
        headline: "Built for people who don't call themselves technical.",
        prompt: "The interface decisions, and their reasoning.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "A coffee shop owner, a photographer, a fitness studio, a retailer, a shopper — none should need experience with complex SaaS to understand the platform. The interface prioritises clear navigation, few steps, readable information, large targets and obvious primary actions.",
              "It deliberately moves away from the stereotypical dark SaaS aesthetic. Forest green, cream, warm gold, soft sage and white give it an identity that reads local and approachable rather than clinical — and the responsive site behaves close to an app while the dedicated app is in development.",
            ],
          },
          {
            type: "specimen",
            swatches: [
              { name: "Forest", value: "#2d4a3e" },
              { name: "Cream", value: "#f3eee3" },
              { name: "Gold", value: "#9c7a3c" },
              { name: "Sage", value: "#3d5e50" },
              { name: "White", value: "#ffffff" },
            ],
          },
          {
            type: "decisions",
            label: "Principles",
            items: [
              "Clear navigation over feature density",
              "Minimal steps to a primary action",
              "Large, obvious interaction targets",
              "Strong, predictable hierarchy",
              "Mobile-first, responsive across every surface",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-discovery",
        scale: "shell",
        visual: {
          src: "/work/my-local-loop/discovery.png",
          width: 2039,
          height: 1262,
          rail: ["Local", "Discovery"],
          focus: "center",
          alt: "The coupon discovery view: every active local deal, counts of live deals, businesses and categories, a search field and category filters.",
          caption:
            "Discovery — every active deal, searchable and filterable by category, so no one is tracking a physical book.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-map",
        scale: "bleed",
        visual: {
          src: "/work/my-local-loop/map.png",
          width: 2037,
          height: 1261,
          rail: ["Local", "Nearby"],
          focus: "center",
          alt: "The map view: participating businesses plotted across Kamloops with location pins.",
          caption:
            "Nearby — discovery is geographic, surfacing participating businesses around the Local using geospatial logic (GeoHashing).",
        },
      },
      {
        kind: "aside",
        id: "exhibit-savings",
        heading: "Reading the screen",
        visual: {
          src: "/work/my-local-loop/savings.png",
          width: 2037,
          height: 1260,
          rail: ["Local", "Savings"],
          focus: "center",
          alt: "The Local savings view: total saved, coupons used, stores visited and average per deal, with a savings-over-time chart and top stores.",
          caption: null,
        },
        notes: [
          {
            label: "Total saved",
            body: "The headline a subscriber opens the app to see — the proof the pass paid for itself.",
          },
          {
            label: "Avg / deal",
            body: "The unit that answers the only question that matters: is each visit worth it?",
          },
          {
            label: "Saved over time",
            body: "A line that should only ever climb — the loop compounding, month over month.",
          },
          {
            label: "Top stores",
            body: "Where the loop is already working, and where the next visit will most likely come from.",
          },
        ],
      },
      {
        kind: "chapter",
        id: "local-pass",
        index: "07",
        label: "The Local Pass",
        headline: "The bridge between the app and the shop counter.",
        prompt: "How the digital marketplace reaches a physical redemption.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The Local Pass is where the digital marketplace meets the physical business. Every Local carries a unique QR code and a unique manual customer code.",
              "At checkout the Local presents the QR for the Partner to scan. If the Partner is on a desktop or can't scan, the manual code is entered by hand instead. Either way the system validates the Local and the coupon rules before the redemption is accepted.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-local-pass",
        scale: "bleed",
        visual: {
          src: "/work/my-local-loop/local-pass.png",
          width: 2044,
          height: 1255,
          rail: ["Local", "Local Pass"],
          focus: "center",
          alt: "The Local Pass: a large personal QR code to scan at checkout, and a manual customer code beneath it.",
          caption:
            "The Local Pass — a unique QR to scan at checkout, with a manual code to read out when a Partner can't scan.",
        },
      },
      {
        kind: "chapter",
        id: "redemption",
        index: "08",
        label: "Redemption Architecture",
        headline: "One identity, validated by us — not by every POS.",
        prompt: "The engineering decision behind redemption.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Giving every Local a platform-controlled identity means a Partner can confirm membership and coupon eligibility through My Local Loop itself, with no integration into their payment system.",
            ],
          },
          {
            type: "flow",
            source: {
              label: "Local Pass",
              note: "one platform-controlled identity",
            },
            branches: [
              { label: "QR code", note: "scanned" },
              { label: "Manual code", note: "entered by hand" },
            ],
            chain: [
              { label: "Partner portal", note: "receives the code" },
              { label: "Validation", note: "is this a real Local?" },
              { label: "Coupon rules", note: "limits, dates, eligibility" },
              { label: "Redeem", note: "accepted" },
              { label: "Redemption recorded", note: "written once" },
              { label: "Analytics", note: "both sides update" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "challenge",
        index: "09",
        label: "The Challenge",
        headline: "The hard part was the seam between the two sides.",
        prompt: "The engineering problems that were genuinely hard.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The Local and Partner experiences are connected but carry completely different permissions and workflows. A Partner should never reach Local-only systems; a Local should never enter Partner administration. Authentication alone wasn't enough — the product needed role-aware authorization throughout.",
              "The second challenge was redemption. Integrating into every business's payment or POS system would be an enormous burden, especially in beta. So My Local Loop owns the redemption layer instead.",
            ],
          },
          {
            type: "statement",
            lines: ["The best integration", "was no integration."],
          },
          {
            type: "paragraphs",
            items: [
              "By giving every Local a platform-controlled identity through their QR and manual code, Partners validate membership and coupon eligibility through My Local Loop — keeping redemption independent of whatever system already sits on their counter.",
            ],
          },
        ],
      },
      {
        kind: "interlude",
        id: "sides-interlude",
        lines: ["One marketplace.", "Two completely", "different users."],
        note: ["Local", "Demand", "Partner", "Supply"],
      },
      {
        kind: "chapter",
        id: "partner",
        index: "10",
        label: "The Partner Experience",
        headline: "The other side of the loop is the operational one.",
        prompt: "What the Partner sees once a Local redeems.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Once a Local redeems an offer, the Partner side becomes the operational view of that activity — redemptions, repeat customers, active coupons and how each offer is performing.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-partner-dashboard",
        scale: "shell",
        visual: {
          src: "/work/my-local-loop/partner-dashboard.png",
          width: 2043,
          height: 1255,
          rail: ["Partner", "Dashboard"],
          focus: "left",
          alt: "The Partner dashboard: redemptions over time, total redemptions, repeat customers, active coupons and coupon performance.",
          caption:
            "The Partner dashboard — the operational view: redemptions over time, repeat customers, and how each offer is performing.",
        },
      },
      {
        kind: "chapter",
        id: "offer-builder",
        index: "11",
        label: "The Offer Builder",
        headline: "This is where the marketplace's supply is made.",
        prompt: "How Partners create inventory themselves.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Offers are created by the Partner, not by us. A Partner sets the title, description, imagery and category; picks a discount type and amount; schedules a start and expiry (or marks it non-expiring); and sets a per-customer limit or allows unlimited redemptions.",
            ],
          },
          {
            type: "steps",
            items: ["Title", "Discount", "Imagery", "Schedule", "Limits", "Publish"],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-offer-builder",
        scale: "shell",
        visual: {
          src: "/work/my-local-loop/offer-builder.png",
          width: 2038,
          height: 1259,
          rail: ["Partner", "Offer builder"],
          focus: "left",
          alt: "The offer builder: fields for title, description, category, discount type and amount, start and expiry dates, a non-expiring toggle and per-customer usage.",
          caption:
            "The offer builder — a Partner makes the marketplace's supply: discount, imagery, schedule and limits, without us managing it.",
        },
      },
      {
        kind: "chapter",
        id: "feedback",
        index: "12",
        label: "The Feedback Loop",
        headline: "Nothing stops when the coupon is redeemed.",
        prompt: "How one side's activity becomes the other side's signal.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Partners can read redemptions, revenue attributed to redemptions, unique customers, average savings, redemption trends, discount mix, and new versus returning customers. What a Partner creates becomes inventory the Local discovers — and what the Local redeems becomes the signal that shapes the next offer.",
            ],
          },
          {
            type: "steps",
            items: [
              "Partner",
              "Storefront",
              "Local",
              "Local Pass",
              "Analytics",
              "Next offer",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-partner-analytics",
        scale: "shell",
        visual: {
          src: "/work/my-local-loop/partner-analytics.png",
          width: 2038,
          height: 1258,
          rail: ["Partner", "Analytics"],
          focus: "left",
          alt: "The Partner analytics view: redemptions, revenue generated, unique customers and average saved, with revenue over time, discount mix and new-versus-returning customers.",
          caption:
            "Partner analytics — redemptions, revenue attributed, unique customers, discount mix and new-versus-returning, after the coupon is redeemed.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-storefront",
        scale: "shell",
        visual: {
          src: "/work/my-local-loop/storefront.png",
          width: 2039,
          height: 1259,
          rail: ["Partner", "Storefront"],
          focus: "center",
          alt: "The Partner storefront: the business's public page on My Local Loop with its live deals, exactly as a shopper sees it.",
          caption:
            "The storefront — what a Partner creates becomes inventory the Local discovers. The supply side, made public.",
        },
      },
      {
        kind: "chapter",
        id: "build",
        index: "13",
        label: "The Build",
        headline: "A two-sided product, drawn the way it stacks.",
        prompt: "How the system is put together, end to end.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "My Local Loop is built with Next.js, React and TypeScript on Tailwind, with PostgreSQL on Neon through Prisma, Clerk for authentication, Stripe for subscriptions, Upstash Redis, Zod and react-markdown. Database migrations are applied manually through Neon, and it's hosted on Vercel.",
            ],
          },
          {
            type: "stack",
            entries: [
              { label: "Local", note: "demand" },
              { label: "Partner", note: "supply" },
            ],
            core: [
              { label: "Clerk", note: "authentication" },
              { label: "Next.js", note: "React / TypeScript" },
              { label: "Application layer", note: "role-aware authorization" },
            ],
            infra: [
              { label: "Prisma", note: "data layer" },
              { label: "Stripe", note: "subscriptions" },
              { label: "Upstash", note: "Redis" },
            ],
            data: { label: "PostgreSQL / Neon", note: "storage · manual migrations" },
            systems: [
              "Offers",
              "Redemptions",
              "Local Pass",
              "Partner applications",
              "Storefronts",
              "Analytics",
              "Geospatial discovery",
              "Role / access control",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "validation",
        index: "14",
        label: "Validation",
        headline: "Not a prototype — a marketplace in use.",
        prompt: "Real, verifiable beta numbers only.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "My Local Loop is operating in a closed beta. These are validation numbers, not growth metrics: real businesses and real consumers are on the platform and redeeming offers.",
              "Feedback from participating businesses has been positive, and the beta keeps surfacing bugs, mobile improvements, onboarding refinements and operational requirements — all being addressed before broader expansion.",
            ],
          },
          {
            type: "metrics",
            metrics: [
              { value: "20", label: "Participating businesses" },
              { value: "12", label: "Consumers" },
              { value: "Kamloops", label: "Core market" },
              { value: "Live", label: "Coupon redemptions" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "learned",
        index: "15",
        label: "What I Learned",
        headline: "A marketplace is a different kind of problem.",
        prompt: "What building this actually taught you.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Building this showed me how different a two-sided marketplace is from a single-user SaaS product. Every decision affects two groups. A great Local experience means little if Partners find offer creation hard; a powerful Partner dashboard means little if Locals don't see enough value to subscribe. The loop only moves when both sides get enough.",
              "Security mattered more than I expected. Authentication alone wasn't enough — the application needed authorization that understood who the user is and what they're permitted to do.",
            ],
          },
          {
            type: "statement",
            lines: [
              "Who you are.",
              "What you're allowed to do.",
              "Not the same question.",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "next",
        index: "16",
        label: "What's Next",
        headline: "Still being built. Still being proven.",
        prompt: "Where the product goes from here.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "My Local Loop remains in active development. Kamloops is the core market, additional cities are applying, and expansion is being introduced gradually. The dedicated consumer app is in development.",
            ],
          },
          {
            type: "list",
            items: [
              {
                title: "Onboard more Partners",
                body: "Keep growing the supply side of the marketplace.",
              },
              {
                title: "Grow consumer adoption",
                body: "Bring more Locals into the loop.",
              },
              {
                title: "Harden the beta",
                body: "Fix bugs and keep improving the mobile experience.",
              },
              {
                title: "Expand carefully",
                body: "Move into additional cities as they're ready.",
              },
              {
                title: "Ship the app",
                body: "Complete the dedicated consumer application.",
              },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "why",
        index: "17",
        label: "Why I Built It",
        headline: "It started as trust between two partners.",
        prompt: "The personal reason behind the product.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "My business partner had seen products I'd built before and trusted me to take the idea behind My Local Loop and turn it into a working platform. That trust let me own the product from concept through implementation.",
              "I also care about the problem. Independent businesses increasingly compete with companies whose resources they can't match. My Local Loop is a chance to build technology that helps them attract customers without adding another marketing expense — an idea between two partners that's now a working marketplace being used by real businesses and consumers.",
            ],
          },
          {
            type: "statement",
            lines: ["Two partners.", "One idea.", "A working marketplace."],
          },
        ],
      },
    ],
  },

  mintlytics: {
    slug: "mintlytics",
    summary:
      "A Pokémon TCG market-intelligence platform — pricing history, portfolio tracking, alerts, market signals, eBay deal discovery, sealed products and collector tools, in one interface.",
    role: [
      "Product Design",
      "Full-Stack Development",
      "UX / UI",
      "Data Engineering",
      "Product Strategy",
    ],
    timeline: "Active development",
    live: "Closed beta",
    hero: {
      src: "/work/mintlytics/landing.png",
      width: 2044,
      height: 1197,
      rail: ["Product", "Mintlytics"],
      focus: "center",
      alt: "The Mintlytics landing page: “Buy the right card. At the right price.”, a fanned stack of Pokémon cards, and a live market ticker of graded-card prices.",
      caption:
        "The public site — pricing history, market signals, deal discovery and collector tools, presented as one terminal for the Pokémon TCG market.",
    },
    sections: [
      {
        kind: "chapter",
        id: "problem",
        index: "01",
        label: "The Problem",
        headline: "The market isn't broken. It's scattered.",
        prompt: "What was broken, who it was broken for, and why it mattered.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The Pokémon market isn't fundamentally broken. Pricing tools exist, marketplaces exist, collection trackers exist, population data exists.",
              "The problem is fragmentation. Checking a price is one platform; tracking a collection is another; marketplace listings, PSA population, alerts and sealed products are each somewhere else. For anyone actively collecting, flipping, grading or managing a larger collection, that pile of separate tools is friction.",
              "I collect Pokémon myself, which gave me a direct read on the questions I wanted answered in one place.",
            ],
          },
          {
            type: "decisions",
            label: "What I kept asking",
            items: [
              "What is this card worth?",
              "What has it been doing over time?",
              "Is the price unusually high or low versus recent history?",
              "Is there a listing below a price I'd pay?",
              "How has my collection changed in value?",
              "What sealed products are moving?",
              "Is Pokémon Center restocking?",
              "Is a PSA population changing?",
            ],
          },
          {
            type: "emphasis",
            lines: [
              "The problem wasn't missing data.",
              "It was having to look everywhere for it.",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "idea",
        index: "02",
        label: "The Idea",
        headline: "One account, one data layer, one market view.",
        prompt: "How the solution was arrived at.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The original idea was an all-in-one tool I could use myself — useful for both sides of the hobby. A collector wants to find cards, track a collection, watch prices, set alerts, complete sets and follow sealed products. A reseller or market participant wants to watch prices, find listings, track spreads, follow activity and compare cost basis against current value.",
              "Over time it grew into a much larger market-intelligence platform, but the goal stayed the same: collapse a dozen disconnected tools into one system.",
            ],
          },
          {
            type: "statement",
            lines: [
              "One account.",
              "One data layer.",
              "One search.",
              "One portfolio.",
              "One alert system.",
              "One market view.",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "terminal",
        index: "03",
        label: "The Data Terminal",
        headline: "Many signals in. One market view out.",
        prompt: "The system that turns scattered sources into one product.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Every external signal Mintlytics reads is normalized into one internal data layer — and that layer, not any single source, is what the features are built on.",
            ],
          },
          {
            type: "terminal",
            hub: "Mintlytics data layer",
            sources: [
              { label: "eBay", note: "active listings" },
              { label: "TCGPro", note: "pricing" },
              { label: "Pokémon catalog", note: "cards + images" },
              { label: "PSA population", note: "scarcity" },
              { label: "Reddit", note: "mentions" },
              { label: "Pokémon Center", note: "restock monitor" },
              { label: "Portfolio activity", note: "user holdings" },
              { label: "Price history", note: "internal store" },
            ],
            features: [
              "Market",
              "Portfolio",
              "Alerts",
              "Sniper",
              "Sealed",
              "PSA",
              "AI",
              "Collection",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "product",
        index: "04",
        label: "The Product",
        headline: "One product, a lot of surface area.",
        prompt: "The breadth of what Mintlytics does.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics combines a broad set of tools against that single data layer. The dashboard is the way in — portfolio value, tracked cards, active alerts and market pulse in one view — with each module a click away in the rail.",
            ],
          },
          {
            type: "list",
            items: [
              {
                title: "Market intelligence",
                body: "Current pricing, movement, sentiment, movers, and set and sealed activity, with comparisons to recent pricing history.",
              },
              {
                title: "Collection & portfolio",
                body: "Track raw, graded and sealed holdings with cost basis, current value and performance over time.",
              },
              {
                title: "Watchlist & alerts",
                body: "Price alerts on absolute values or percentage moves, plus thresholds for prices you'd personally buy at.",
              },
              {
                title: "eBay Sniper",
                body: "Watch cards and compare live listings against tracked market pricing at a margin you define.",
              },
              {
                title: "Sealed, sets & PSA",
                body: "A sealed catalog, set-completion tracking, and population and scarcity context where data exists.",
              },
              {
                title: "AI, grounded in the data",
                body: "A card assessor and a conversational analyst that read Mintlytics' own market context.",
              },
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-dashboard",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/dashboard.png",
          width: 2045,
          height: 1257,
          rail: ["System", "Dashboard"],
          focus: "left",
          alt: "The Mintlytics dashboard: portfolio value, tracked cards, active alerts and PSA population changes, a portfolio-value chart, a collection table and a live market-pulse panel.",
          caption:
            "The dashboard — the way into the product: portfolio value, alerts and market pulse, with every module one click away in the rail.",
        },
      },
      {
        kind: "chapter",
        id: "design",
        index: "05",
        label: "The Design",
        headline: "A trading terminal that's still, unmistakably, a Pokémon tool.",
        prompt: "The interface direction, and its reasoning.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Most collection tools feel static, plain and database-like. Mintlytics was designed to feel closer to a trading platform — deep-navy surfaces, cyan and mint data accents, dense dashboards, large card imagery, charts, tickers and live status — because the audience includes collectors and market participants who enjoy highly visual products.",
              "The energy is deliberate, but never at the cost of legibility: the goal is immersion that stays easy to use.",
            ],
          },
          {
            type: "mint-specimen",
            swatches: [
              { name: "Surface", value: "#0a0e1a" },
              { name: "Signal", value: "#22d3ee" },
              { name: "Gain", value: "#34d399" },
              { name: "Watch", value: "#f5b74a" },
              { name: "Risk", value: "#fb7185" },
              { name: "Accent", value: "#8b5cf6" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "build",
        index: "06",
        label: "The Build",
        headline: "A broad stack, kept legible.",
        prompt: "How the system is put together, end to end.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics is a Next.js and React 19 app in TypeScript on Node 20, with Prisma over PostgreSQL on Neon, NextAuth for auth, and Tailwind, shadcn/ui and Recharts on the front. It runs on Vercel, with scheduled work on Vercel Cron guarded by wall-clock limits and a start/end log-event pattern for observability.",
              "The data comes from several external systems — TCGPro through RapidAPI (capped near 2,400 calls a day), the PokémonTCG.io catalog for cards and images, the eBay Browse API for the sniper feed, the Reddit API for mentions, and ScrapingBee for Pokémon Center monitoring.",
            ],
          },
          {
            type: "techstack",
            groups: [
              { label: "Framework", items: ["Next.js", "React 19", "Node 20"] },
              { label: "Language", items: ["TypeScript"] },
              { label: "Data", items: ["Prisma 7", "PostgreSQL / Neon"] },
              {
                label: "UI",
                items: ["Tailwind CSS v4", "shadcn/ui", "Recharts", "lucide-react"],
              },
              { label: "Auth", items: ["NextAuth"] },
              {
                label: "Hosting / ops",
                items: [
                  "Vercel",
                  "Vercel Cron",
                  "wall-clock guards",
                  "start/end log events",
                ],
              },
              {
                label: "Data sources",
                items: [
                  "TCGPro (RapidAPI)",
                  "PokémonTCG.io",
                  "eBay Browse API",
                  "Reddit API",
                  "ScrapingBee",
                ],
              },
              { label: "Tooling", items: ["tsx", "ESLint", "Prettier"] },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "data-problem",
        index: "07",
        label: "The Data Problem",
        headline: "The better data was the data we didn't rent.",
        prompt: "The hardest engineering problem in the product.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The hardest part of Mintlytics has been data reliability. Early on it leaned heavily on external APIs for market information, and that brought stale data, changing APIs, rate limits and a dependency on third-party availability — plus the difficulty of maintaining consistent historical data.",
              "TCGPro was an important pricing source, and still is. But relying entirely on outside providers would cap what the product could become. So Mintlytics is gradually building its own historical pricing database instead — deliberately limiting external calls to roughly 2,400 a day while collecting and storing data internally.",
              "The tradeoff is time. Building a reliable historical dataset is slower than displaying an external API response. It's also a far stronger long-term foundation.",
            ],
          },
          {
            type: "statement",
            lines: [
              "The fastest way to build it was",
              "to rely on someone else's data.",
              "The better way was to start",
              "building our own.",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "ingestion",
        index: "08",
        label: "Data Ingestion",
        headline: "One pipeline, built to be trusted over time.",
        prompt: "How data actually moves through the system.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "External sources feed a controlled pipeline — polling within limits, validation, normalization — into a historical price store, and the platform's surfaces read from that store.",
            ],
          },
          {
            type: "ingestion",
            sources: [
              "TCGPro",
              "eBay",
              "Pokémon catalog",
              "Reddit",
              "Pokémon Center",
            ],
            stages: [
              { label: "Rate limit / polling / cron", note: "~2,400 calls a day" },
              { label: "Validation", note: "shape + sanity checks" },
              { label: "Normalization", note: "one internal shape" },
              { label: "Prisma", note: "data layer" },
              { label: "PostgreSQL / Neon", note: "storage" },
              { label: "Historical price store", note: "the long-term foundation" },
            ],
            features: [
              "Market",
              "Sniper",
              "Portfolio",
              "Alerts",
              "AI",
              "Sealed",
              "PSA",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "market",
        index: "09",
        label: "Market Intelligence",
        headline: "Where the market reads at a glance.",
        prompt: "The platform's read on the market.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Market Intelligence is the platform's read on the Pokémon market: catalog size, active sets, movers, sentiment, and cards meeting relative-pricing criteria.",
              "The “Undervalued Cards” panel is careful by design. Mintlytics doesn't claim to know a card's true value — it surfaces cards trading below selected historical benchmarks (like a 90-day average) and orders them by platform-defined opportunity signals. The word is a label for a relationship to recent history, not an objective truth.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-market",
        scale: "bleed",
        visual: {
          src: "/work/mintlytics/market-intelligence.png",
          width: 2056,
          height: 1261,
          rail: ["Market", "Intelligence"],
          focus: "left",
          alt: "Market Intelligence: catalog size, an undervalued-now count, biggest mover and most active set, a market-sentiment gauge, and a list of cards trading below their 90-day average.",
          caption:
            "Market Intelligence — sentiment, movers and active sets, plus cards trading below selected historical benchmarks, ordered by platform-defined opportunity signals.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-sentiment",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/market-sentiment.png",
          width: 1801,
          height: 1176,
          rail: ["Signal", "Market sentiment"],
          focus: "center",
          alt: "The Market Sentiment panel: a bull/bear gauge reading 73/100, 30-day price-trend and volume indicators, top sets by comps, and an undervalued-cards list, with a “not financial advice” note.",
          caption:
            "Market sentiment — a health read across tracked cards, carrying the platform's own “not financial advice, do your own research” note in the footer.",
        },
      },
      {
        kind: "chapter",
        id: "deal",
        index: "10",
        label: "The Deal System",
        headline: "A deal is a personal number, not a verdict.",
        prompt: "The product philosophy behind what counts as a deal.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "In collectibles, what counts as a deal is subjective. Mintlytics doesn't treat a market price as a guaranteed signal — it helps a user define what a good entry price means to them.",
              "You can watch a card, view its history, set a threshold and a target margin, and get an alert when the market reaches it. For cards with strong demand, rarity or historical significance, you might watch for temporary weakness — but the platform never implies that popularity guarantees future appreciation.",
            ],
          },
          {
            type: "statement",
            lines: [
              "The platform doesn't decide",
              "what a deal is.",
              "The user sets the threshold.",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "sniper",
        index: "11",
        label: "eBay Sniper",
        headline: "Stop refreshing the marketplace.",
        prompt: "How the deal-discovery feed works.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The eBay Sniper watches cards you choose and compares active eBay listings against Mintlytics' tracked market pricing. You define the margin or threshold; when listings meet your criteria, Mintlytics surfaces them for review — so you're not searching listings by hand all day.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-sniper",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/ebay-sniper.png",
          width: 2056,
          height: 1258,
          rail: ["Market", "eBay Sniper"],
          focus: "left",
          alt: "The eBay Sniper: a grid of watched cards, each with its tracked market price, an alert-below threshold and a target margin, and a “scan eBay” action.",
          caption:
            "eBay Sniper — watch cards, then compare live listings against tracked pricing at a margin you set. No deals are implied; the thresholds are yours.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-sniper-alert",
        scale: "inset",
        visual: {
          src: "/work/mintlytics/sniper-alert.png",
          width: 2049,
          height: 1260,
          rail: ["Alert", "Target margin"],
          focus: "center",
          alt: "The Sniper alert modal: “alert me when listed 15% below market for PSA 10”, a grade selector, the tracked market value, an alert-when-below price, and a 5–50% target-margin slider.",
          caption:
            "The target-margin control — the user defines how far below tracked market a listing must fall before Mintlytics surfaces it.",
        },
      },
      {
        kind: "chapter",
        id: "portfolio",
        index: "12",
        label: "Portfolio",
        headline: "Your collection, read as a portfolio.",
        prompt: "How the collection is tracked over time.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics treats a collection as a tracked portfolio: cost basis, current value, realized and unrealized gains, performance over time, composition, cards versus sealed, and top and underperformers — built from stored price history rather than a single live lookup.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-portfolio",
        scale: "bleed",
        visual: {
          src: "/work/mintlytics/portfolio.png",
          width: 2058,
          height: 1263,
          rail: ["Portfolio", "Performance"],
          focus: "left",
          alt: "The Portfolio view: total value, total invested, all-time return, best and worst month, a portfolio-value-over-time chart, and realized and unrealized gains.",
          caption:
            "Portfolio — the collection read as a tracked portfolio, built from stored price history rather than a single live lookup.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-portfolio-composition",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/portfolio-composition.png",
          width: 2056,
          height: 1257,
          rail: ["Portfolio", "Composition"],
          focus: "left",
          alt: "Portfolio Composition: a donut of value by era, a “you vs the TCG market” comparison, monthly performance, and separate sealed-portfolio performance.",
          caption:
            "Composition — where value concentrates, and how the portfolio compares to a broad market read. Sealed is tracked on its own.",
        },
      },
      {
        kind: "chapter",
        id: "collection",
        index: "13",
        label: "Collection, Sealed & Sets",
        headline: "Raw, graded and sealed — in one place.",
        prompt: "The collector side of the product.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics was built for more than individual cards. Raw, graded and sealed holdings live in one environment, with sealed products tracked separately where it matters — their pricing and behaviour differ from singles.",
              "It's not only for flipping or speculation, either. Set-completion tracking supports collectors whose goal is simply finishing a set, with an estimated cost to complete where the data exists.",
            ],
          },
          { type: "steps", items: ["Raw", "Graded", "Sealed"] },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-collection",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/collection.png",
          width: 2058,
          height: 1257,
          rail: ["Collection", "Holdings"],
          focus: "left",
          alt: "My Collection: holdings across cards and sealed, cost basis, current value and total P&L, with raw / graded / sealed filters and a card detail.",
          caption:
            "Collection — raw, graded and sealed holdings in one place, with cost basis and current value per item.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-sealed",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/sealed.png",
          width: 2053,
          height: 1265,
          rail: ["Market", "Sealed"],
          focus: "left",
          alt: "Sealed Products: a sealed-product catalog with market, collection, sniper and deals tabs, and booster boxes with current values.",
          caption:
            "Sealed — a catalog tracked separately from singles, because sealed pricing and behaviour differ.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-sets",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/set-completion.png",
          width: 2058,
          height: 1260,
          rail: ["Collection", "Set tracker"],
          focus: "left",
          alt: "The Set Completion Tracker: sets tracked, total cards owned, most-complete set and cost to complete, with a grid of sets and per-set completion.",
          caption:
            "Set tracker — the non-investment side: owned cards by set, completion, and an estimated cost to complete where data exists.",
        },
      },
      {
        kind: "chapter",
        id: "alerts",
        index: "14",
        label: "Alerts",
        headline: "Alerts on your terms, not a generic signal.",
        prompt: "How users define what they get told about.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Users can set alerts on cards they own or cards they want to buy. A threshold can be an absolute price, a percentage increase or a percentage decrease — so Mintlytics notifies you against your own goals rather than forcing one signal onto every collector.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-price-alert",
        scale: "inset",
        visual: {
          src: "/work/mintlytics/price-alert.png",
          width: 2056,
          height: 1257,
          rail: ["Alert", "Price watch"],
          focus: "center",
          alt: "The Set price alert modal: notify when price rises above or drops below a value, or rises or drops a percentage from today, with email and in-app toggles.",
          caption:
            "Price watch — an alert can be an absolute price or a percentage move, on a card you own or one you want to buy.",
        },
      },
      {
        kind: "chapter",
        id: "monitor",
        index: "15",
        label: "Pokémon Center Monitor",
        headline: "Watching the restock, so you don't have to.",
        prompt: "The restock-monitoring feature and how it polls.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "A radar polls pokemoncenter.com every 2–5 minutes during peak restock windows and can alert you when queue or restock activity is detected. It runs on a controlled polling schedule through ScrapingBee — precise about the windows it watches rather than claiming constant real-time detection.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-pc-queue",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/pc-queue.png",
          width: 2055,
          height: 1256,
          rail: ["Monitor", "PC queue"],
          focus: "left",
          alt: "The Pokémon Center queue tracker: a radar “watching Pokémon Center”, armed push and email channels, a flight recorder of recent queues, and stats on queues detected.",
          caption:
            "PC queue — a radar that polls Pokémon Center every 2–5 minutes during peak restock windows and pings you when queue activity is detected.",
        },
      },
      {
        kind: "chapter",
        id: "psa",
        index: "16",
        label: "PSA / Scarcity",
        headline: "Scarcity as context, not a promise.",
        prompt: "How population data is framed.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics tracks population and scarcity data for selected graded cards where it's available, so you can read population context and 30-day movement alongside pricing. Scarcity is context — the platform doesn't imply that a low population alone predicts appreciation.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-psa",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/psa-tracker.png",
          width: 2056,
          height: 1259,
          rail: ["Data", "PSA"],
          focus: "left",
          alt: "The PSA Tracker: a featured graded card with its PSA 10 population, a scarcity dashboard of pop counts, tiers, prices and 30-day movement, and a pop-trend section.",
          caption:
            "PSA — population and scarcity context alongside pricing, with 30-day movement. Scarcity is context, not a prediction.",
        },
      },
      {
        kind: "chapter",
        id: "ai",
        index: "17",
        label: "AI, Grounded in the Data",
        headline: "AI that stays in its lane.",
        prompt: "How the AI features are scoped and framed.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics' AI features surface and interpret the platform's own data. The assessor is a card-focused view that reads Mintlytics' market context; the analyst, Mintly, is a conversational interface that answers questions about cards, sealed products, market context, portfolio data and grading — and cites platform data rather than inventing numbers.",
              "The framing is deliberate, and stated in the product itself: informational and research-oriented, not financial advice.",
            ],
          },
          {
            type: "emphasis",
            lines: [
              "AI should be grounded in the data",
              "Mintlytics already has.",
            ],
          },
        ],
      },
      {
        kind: "exhibit",
        id: "exhibit-ai-assessor",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/ai-assessor.png",
          width: 2057,
          height: 1259,
          rail: ["AI", "Assessor"],
          focus: "left",
          alt: "The Mintly AI Assessor: a card search that returns a structured read grounded in real market data and PSA population, with example cards to try.",
          caption:
            "AI Assessor — a card-focused read of Mintlytics' own market context. Informational and research-oriented, not financial advice.",
        },
      },
      {
        kind: "exhibit",
        id: "exhibit-ai-analyst",
        scale: "shell",
        visual: {
          src: "/work/mintlytics/ai-analyst.png",
          width: 2054,
          height: 1260,
          rail: ["AI", "Analyst"],
          focus: "left",
          alt: "AI Analyst “Mintly”: a grounded conversational analyst with starter prompts, a list of what it can do, and a footer reading “not financial advice · informational only · grounded in platform data”.",
          caption:
            "AI Analyst — a conversational interface that cites platform data and says so when the data isn't there. The footer states the framing: informational only.",
        },
      },
      {
        kind: "interlude",
        id: "scale-interlude",
        lines: [
          "The hard part wasn't",
          "building another feature.",
          "It was keeping the system coherent.",
        ],
        note: ["Catalog", "Pricing", "Jobs", "Scraping", "Alerts", "AI"],
      },
      {
        kind: "chapter",
        id: "challenge",
        index: "18",
        label: "The Challenge",
        headline: "Scale was the feature nobody asked for.",
        prompt: "The engineering problem the product's size created.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics became much larger than a single-feature app: catalog data, pricing, historical storage, scheduled jobs, scraping, external APIs, alerts, portfolio tracking, sealed products, AI, market intelligence, PSA, Reddit activity, eBay listings and Pokémon Center monitoring.",
              "For a solo developer, keeping those systems understandable and maintainable became a product and engineering challenge in itself.",
            ],
          },
          {
            type: "decisions",
            label: "What it forced me to think about",
            items: [
              "Boundaries between systems",
              "Scheduled jobs and cron",
              "Observability",
              "Rate limits",
              "Failure recovery",
              "Data freshness",
              "Database growth",
              "Long-running collection",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "validation",
        index: "19",
        label: "Validation",
        headline: "Not launched — matured.",
        prompt: "Real, verifiable status only.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics has 15 users and remains in closed beta. It is intentionally not public yet, and the reason is data maturity.",
              "Rather than launch immediately with shallow data, the priority is building enough internal pricing history — roughly six months of useful context — before a broader release. It's a deliberate product decision to build the foundation first.",
            ],
          },
          {
            type: "metrics",
            metrics: [
              { value: "15", label: "Beta users" },
              { value: "~2,400", label: "External calls / day limit" },
              { value: "~6 mo", label: "Target pricing history before public" },
              { value: "Closed", label: "Beta" },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "learned",
        index: "20",
        label: "What I Learned",
        headline: "Data you can trust is the hard part.",
        prompt: "What building this actually taught you.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "Mintlytics taught me how different a data-heavy product is from a traditional CRUD app — external APIs and their limits, cron jobs, scraping, scheduled polling, historical price storage, normalization, database growth, portfolio math, charting, alerts, background systems, observability, and integrating independent data sources.",
              "It also taught a product lesson: more features don't automatically make a better product. Mintlytics grew fast, and building it forced me to think about which systems deserve to exist, which data is reliable enough to show, and when not to launch something just because it technically works.",
            ],
          },
          {
            type: "statement",
            lines: [
              "Building the feature was easy",
              "compared with building data I could trust.",
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "next",
        index: "21",
        label: "What's Next",
        headline: "The data layer, first.",
        prompt: "Where the product goes from here.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "The current priority is the data layer — continuing to collect historical pricing toward roughly six months of useful history before a wider public release. Once the foundation is mature enough, the next major phase is a dedicated app, which will make alerts far more useful through push notifications rather than relying primarily on email.",
            ],
          },
          {
            type: "list",
            items: [
              {
                title: "Grow the pricing history",
                body: "Keep collecting internal data toward a usable historical foundation.",
              },
              {
                title: "A dedicated app",
                body: "The next major phase, once the data is mature enough to support it.",
              },
              {
                title: "Push notifications",
                body: "Make alerts land in the moment, not just by email.",
              },
            ],
          },
        ],
      },
      {
        kind: "chapter",
        id: "why",
        index: "22",
        label: "Why I Built It",
        headline: "I built it because I'm in the market it serves.",
        prompt: "The personal reason behind the product.",
        blocks: [
          {
            type: "paragraphs",
            items: [
              "I collect Pokémon cards, and I wanted tools that could help me understand what I owned, know what it was worth, track changes over time, find cards at prices I was comfortable paying, monitor opportunities and manage sealed products.",
              "The more I built, the more I saw the same system could help people with very different goals — completing sets, watching high-end cards, collecting sealed, buying and selling, or simply wanting better information. Mintlytics became an attempt to support all of those from one platform.",
            ],
          },
          {
            type: "statement",
            lines: ["Better information.", "Not guaranteed outcomes."],
          },
        ],
      },
    ],
  },
};

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies[slug];
}
