import { caseStudyBySlug } from "@/data/case-studies";

export type CaseImage = { src: string; width: number; height: number; alt: string };

function isImage(value: unknown): value is CaseImage {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.src === "string" &&
    typeof v.width === "number" &&
    typeof v.height === "number" &&
    typeof v.alt === "string"
  );
}

/**
 * A screenshot from a project's case study, looked up by its file path.
 *
 * Lets other pages show a case study's real screenshots with the alt text and
 * dimensions already written for them there, instead of keeping a second copy
 * of either that could drift. Returns undefined if the case study doesn't use
 * that image.
 */
export function caseImage(slug: string, src: string): CaseImage | undefined {
  const study = caseStudyBySlug(slug);
  if (!study) return undefined;

  const queue: unknown[] = [study];
  while (queue.length) {
    const value = queue.shift();
    if (isImage(value) && value.src === src) {
      return { src: value.src, width: value.width, height: value.height, alt: value.alt };
    }
    if (value && typeof value === "object") queue.push(...Object.values(value));
  }
  return undefined;
}
