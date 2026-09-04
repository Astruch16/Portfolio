/**
 * What STACK.RUNTIME shows.
 *
 * Three categories, each holding the technologies used in it and a one-line
 * example. Edit this file to change the stack — nothing else knows the
 * technologies, and the triggers, counts and panels all read straight from it.
 *
 * The snippets are stock examples, meant to be replaced with real ones from
 * the codebases they come from. Keep lines under ~34 characters so the panel
 * never has to wrap.
 */

export type SnippetTone = "plain" | "keyword" | "muted" | "success";

export type SnippetToken = { text: string; tone?: SnippetTone };

export type StackEntry = {
  name: string;
  /** One or two lines. Short enough to read at a glance. */
  lines: SnippetToken[][];
};

export type StackCategory = {
  id: string;
  label: string;
  /** Shown as the panel's path, e.g. ~/stack/frontend */
  path: string;
  entries: StackEntry[];
};

const kw = (text: string): SnippetToken => ({ text, tone: "keyword" });
const ok = (text: string): SnippetToken => ({ text, tone: "success" });

export const stackCategories: StackCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    path: "~/stack/frontend",
    entries: [
      {
        name: "TypeScript",
        lines: [[kw("type "), { text: "Status = " }, ok('"live"'), { text: ' | "wip"' }]],
      },
      {
        name: "React",
        lines: [[kw("const "), { text: "{ data } = useWork(slug)" }]],
      },
      {
        name: "Next.js",
        lines: [[kw("const "), { text: "work = " }, kw("await "), { text: "getWork()" }]],
      },
      {
        name: "Tailwind CSS",
        lines: [[{ text: "<Row " }, kw("className"), { text: '="border-b py-6" />' }]],
      },
      {
        name: "shadcn/ui",
        lines: [[{ text: "<Dialog.Content " }, kw("asChild"), { text: " />" }]],
      },
      {
        name: "Motion",
        lines: [[{ text: "<motion.div " }, kw("animate"), { text: "={{ opacity: 1 }} />" }]],
      },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    path: "~/stack/backend",
    entries: [
      {
        name: "Node.js",
        lines: [[kw("export async function "), { text: "GET() {}" }]],
      },
      {
        name: "Supabase",
        lines: [
          [kw("const "), { text: "{ data } = " }, kw("await "), { text: "supabase" }],
          [{ text: '  .from("projects").select()' }],
        ],
      },
      {
        name: "PostgreSQL",
        lines: [
          [kw("select "), { text: "slug " }, kw("from "), { text: "projects" }],
          [kw("where "), { text: "status = " }, ok("'live'"), { text: ";" }],
        ],
      },
      {
        name: "Server Actions",
        lines: [[{ text: '"use server"' }, { text: " — mutate, then " }, kw("revalidate")]],
      },
      {
        name: "Auth",
        lines: [[kw("const "), { text: "session = " }, kw("await "), { text: "getSession()" }]],
      },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    path: "~/stack/infra",
    entries: [
      {
        name: "Vercel",
        lines: [[{ text: "vercel deploy " }, kw("--prod")]],
      },
      {
        name: "Git",
        lines: [[{ text: "git commit -m " }, ok('"feat: ship it"')]],
      },
      {
        name: "CI",
        lines: [[{ text: "tsc --noEmit && vitest run" }]],
      },
      {
        name: "Environments",
        lines: [[{ text: "loadEnv(" }, ok('".env.local"'), { text: ")" }]],
      },
    ],
  },
];
