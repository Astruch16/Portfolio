import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's stock scales. Our design tokens add
 * font sizes (`text-statement`) and colours (`text-accent`) that it cannot
 * classify, so it lumped them into one group and let a colour silently drop a
 * size — `cn("text-statement", "text-accent")` was rendering statement type at
 * base size. Teaching it the custom scales fixes that for every call site.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["2xs", "lead", "statement", "section", "display"] },
      ],
      "text-color": [
        {
          text: [
            "bg",
            "fg",
            "muted",
            "faint",
            "hairline",
            "hairline-strong",
            "cream",
            "void",
            "ink",
            "paper",
            "accent",
            "signal",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
