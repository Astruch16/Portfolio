/**
 * Samples the hero name's letterforms and emits the grid used to rebuild them
 * out of code symbols.
 *
 * Run against a dev server so the real display face is loaded and measured —
 * the whole point is that the mosaic follows the actual typeface, kerning and
 * letter-spacing rather than a hand-drawn approximation:
 *
 *   npm run dev
 *   node scripts/generate-name-mosaic.mjs > /tmp/mosaic.ts && mv /tmp/mosaic.ts src/data/name-mosaic.ts
 *
 * Write via a temporary file, not straight over the target: a redirect
 * truncates its destination before the script runs, and a failed run would
 * otherwise leave the site unable to build.
 *
 * Needs Playwright, which is not a project dependency: `npm i -D playwright`.
 *
 * Everything it emits is normalised to the font size, so one pass covers every
 * step of the responsive clamp.
 */
import { chromium } from "playwright";

const LINES = ["Adam", "Struch"];
/** Cell pitch, in em. Small enough to read as a word, large enough that each
 *  symbol is still individually legible. */
const CELL = 0.042;
const RENDER_PX = 400;

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? undefined,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto(process.env.ORIGIN ?? "http://localhost:3000", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const lines = await page.evaluate(
  ({ LINES, CELL, RENDER_PX }) => {
    // A probe of its own rather than the hero's heading: the heading renders
    // the mosaic this script produces, and reading metrics off it would make
    // the generator unable to run whenever its own output is missing.
    const probe = document.createElement("span");
    probe.className = "display";
    probe.style.fontSize = "100px";
    probe.textContent = "ADAM";
    document.body.append(probe);
    const cs = getComputedStyle(probe);
    const font = `${cs.fontWeight} ${RENDER_PX}px ${cs.fontFamily}`;
    const tracking = parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const lines = LINES.map((raw) => {
      const text = raw.toUpperCase();
      ctx.font = font;
      ctx.letterSpacing = `${tracking * RENDER_PX}px`;

      const metrics = ctx.measureText(text);
      // Font metrics, not ink metrics: this is what decides where the baseline
      // sits inside a CSS line box, and therefore where the ink lands.
      const fontAscent = metrics.fontBoundingBoxAscent;
      const fontDescent = metrics.fontBoundingBoxDescent;
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent);
      const descent = Math.ceil(metrics.actualBoundingBoxDescent);
      const width = Math.ceil(metrics.width) + 4;
      const height = ascent + descent + 4;

      canvas.width = width;
      canvas.height = height;
      ctx.font = font;
      ctx.letterSpacing = `${tracking * RENDER_PX}px`;
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(text, 2, ascent + 2);

      // Character boundaries, so every cell knows which letter it belongs to
      // and the typing reveal can still run letter by letter.
      const bounds = [];
      for (let i = 1; i <= text.length; i += 1) {
        ctx.font = font;
        ctx.letterSpacing = `${tracking * RENDER_PX}px`;
        bounds.push(ctx.measureText(text.slice(0, i)).width + 2);
      }

      const pixels = ctx.getImageData(0, 0, width, height).data;
      const step = CELL * RENDER_PX;
      const cells = [];

      for (let y = step / 2; y < height; y += step) {
        for (let x = step / 2; x < width; x += step) {
          const px = Math.floor(x);
          const py = Math.floor(y);
          if (pixels[(py * width + px) * 4 + 3] < 108) continue;
          let index = bounds.findIndex((edge) => x <= edge);
          if (index === -1) index = text.length - 1;
          cells.push([
            Number((x / RENDER_PX).toFixed(4)),
            Number((y / RENDER_PX).toFixed(4)),
            index,
          ]);
        }
      }

      // CSS puts the baseline at half the leftover leading plus the ascent.
      const lineBox = parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) * RENDER_PX;
      const baseline = (lineBox - (fontAscent + fontDescent)) / 2 + fontAscent;

      return {
        text,
        width: Number((width / RENDER_PX).toFixed(4)),
        height: Number((height / RENDER_PX).toFixed(4)),
        /** Line box and the ink's offset within it, both in em. */
        lineHeight: Number((lineBox / RENDER_PX).toFixed(4)),
        inkTop: Number(((baseline - ascent - 2) / RENDER_PX).toFixed(4)),
        characters: text.length,
        cells,
      };
    });

    probe.remove();
    return lines;
  },
  { LINES, CELL, RENDER_PX },
);

await browser.close();

const total = lines.reduce((n, l) => n + l.cells.length, 0);
process.stdout.write(`/**
 * The hero name, sampled from its own letterforms.
 *
 * GENERATED — do not edit by hand. Regenerate with the dev server running:
 *   node scripts/generate-name-mosaic.mjs > src/data/name-mosaic.ts
 *
 * Every value is normalised to the font size, so one pass covers the whole
 * responsive clamp. \`cells\` is [x, y, characterIndex] in em from the line's
 * top-left; the character index is what lets the typing reveal still run
 * letter by letter. ${total} cells across ${lines.length} lines.
 */

export type MosaicLine = {
  text: string;
  /** Em, including the trailing sample padding. */
  width: number;
  height: number;
  /** The display face's own leading, in em. */
  lineHeight: number;
  /** Where the ink starts inside that line box, in em. */
  inkTop: number;
  characters: number;
  cells: [x: number, y: number, character: number][];
};

/** Em pitch between cells — the component sizes its symbols from this. */
export const MOSAIC_CELL = ${CELL};

export const nameMosaic: MosaicLine[] = ${JSON.stringify(lines, null, 2)};
`);
