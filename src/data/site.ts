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
