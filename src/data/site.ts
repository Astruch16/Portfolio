export type NavItem = {
  label: string;
  href: string;
  /** Shown in the mobile menu as an index; also used for the desktop hover state. */
  index: string;
};

export const navItems: NavItem[] = [
  { label: "Work", href: "/work", index: "01" },
  { label: "About", href: "/about", index: "02" },
  { label: "Build Log", href: "/build-log", index: "03" },
  { label: "Playground", href: "/playground", index: "04" },
  { label: "Contact", href: "/contact", index: "05" },
];

/**
 * A way to reach Adam.
 *
 * `href` null means the account isn't confirmed yet, and the contact page
 * renders a marked pending row rather than a dead link — same convention the
 * rest of the site uses for content that doesn't exist yet.
 */
export type ContactChannel = {
  label: string;
  handle: string | null;
  href: string | null;
  /** One line on what this channel is actually good for. */
  note: string;
};

export const contact = {
  /**
   * PLACEHOLDER-ish: this is Adam's real address and already public in this
   * repo's commit history, but it's a personal Gmail. Swap it for an address on
   * the real domain once that domain is confirmed — see `site.url`.
   */
  email: "adamstruch@gmail.com",
  /** Prefilled so a message arrives already sorted. */
  subject: "Hello from your portfolio",
  /** IANA zone, so the clock is computed rather than claimed. */
  timezone: "America/Vancouver",
  channels: [
    {
      label: "GitHub",
      handle: "@Astruch16",
      href: "https://github.com/Astruch16",
      note: "Source, commits and the code behind this site",
    },
    {
      label: "LinkedIn",
      handle: null,
      href: null,
      note: "Roles, referrals and the longer background",
    },
    {
      label: "X",
      handle: null,
      href: null,
      note: "Work in progress and the occasional build note",
    },
  ] satisfies ContactChannel[],
  /**
   * What is actually worth writing about. Kept honest and specific — a generic
   * "any enquiry welcome" tells a reader nothing about whether to bother.
   */
  wants: [
    "Design engineering or product engineering roles",
    "Full-stack product work where design and code aren’t separate jobs",
    "Freelance builds for small teams and local businesses",
    "Anything where I’d be close to both the user and the code",
  ],
} as const;

export const site = {
  name: "Adam Struch",
  monogram: "AS_",
  role: "Design Engineer & Full-Stack Developer",
  location: {
    city: "Chilliwack, BC",
    /* Deliberately an annotation, not a position. */
    region: "Pacific / Canada",
    country: "Canada",
  },
  status: {
    label: "Building",
    available: "Available",
    detail: "For the right team",
    open: "Open to opportunities",
  },
  current: ["Designing.", "Building.", "Shipping."],
  // PLACEHOLDER — not the confirmed domain. Everything that needs an absolute
  // URL (metadata, canonicals, OG, sitemap) reads it from here, so swapping it
  // once is enough.
  url: "https://struch.dev",
} as const;
