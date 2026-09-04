/**
 * Ordered tones for numbered sequences — chapter indices and numbered lists.
 *
 * A column of indices in one colour reads as a single grey block and gives the
 * eye nothing to count against. These step through the page's existing legend —
 * the project's own colour first, then the status lime, steel and amber already
 * used on the spec sheet — extended with a few equally desaturated neighbours so
 * a nine-chapter page never repeats. Held at similar luminance so the result
 * reads as a coded index rather than a rainbow. Cycles if a list outgrows it.
 */
const TONES = [
  "#b6e53b",
  "#7fb4c9",
  "#e0a94f",
  "#e6e6ea",
  "#c98bd9",
  "#d98f7a",
  "#8ad9b0",
  "#b9b2a6",
];

export function sequenceTone(index: number, accent: string): string {
  return index === 0 ? accent : TONES[(index - 1) % TONES.length];
}
