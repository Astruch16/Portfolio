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

/**
 * The same idea for a cream ground.
 *
 * `TONES` is pitched for a dark surface — several of its entries are near-white
 * and vanish on paper, which is exactly what happened to the last stop of the
 * about page's route. These are the same hues taken down to where they hold
 * against cream, at similar weight to each other so the index still reads as a
 * legend rather than a rainbow.
 */
const TONES_LIGHT = [
  "#2f7d6b",
  "#b0761a",
  "#3f6ea8",
  "#9a4f7a",
  "#6b8f3d",
  "#a85434",
];

export function sequenceToneLight(index: number, accent: string): string {
  return index === 0 ? accent : TONES_LIGHT[(index - 1) % TONES_LIGHT.length];
}
