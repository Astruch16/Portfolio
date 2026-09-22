import type { MosaicLine } from "@/data/name-mosaic";

/**
 * Samples lines of text into the cell grid the name field draws from.
 *
 * The same pass `scripts/generate-name-mosaic.mjs` makes against a headless
 * browser, moved into the page so the playground can sample whatever a visitor
 * types. The build-time script stays where it is: the hero's own name is fixed,
 * and sampling it on every load would be work for an answer that never changes.
 *
 * Everything it returns is normalised to the font size, so one pass covers the
 * whole responsive clamp — exactly as the generated data is.
 */

/** Sampled at this size, then divided back down. Big enough that thin strokes survive. */
const RENDER_PX = 400;
/** Below this alpha a pixel is counted as paper rather than ink. */
const INK = 108;

export function sampleMosaic(lines: string[], cell: number): MosaicLine[] {
  // A probe of its own: reading metrics off the rendered name would make this
  // depend on what it is about to draw.
  const probe = document.createElement("span");
  probe.className = "display";
  probe.style.cssText = "position:absolute;visibility:hidden;font-size:100px";
  probe.textContent = "ADAM";
  document.body.append(probe);

  const style = getComputedStyle(probe);
  const font = `${style.fontWeight} ${RENDER_PX}px ${style.fontFamily}`;
  const tracking = (parseFloat(style.letterSpacing) || 0) / parseFloat(style.fontSize);
  const lineBox = (parseFloat(style.lineHeight) / parseFloat(style.fontSize)) * RENDER_PX;
  probe.remove();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  const setFont = () => {
    ctx.font = font;
    ctx.letterSpacing = `${tracking * RENDER_PX}px`;
  };

  return lines.map((raw) => {
    const text = raw.toUpperCase();
    setFont();

    const metrics = ctx.measureText(text || " ");
    // Font metrics, not ink metrics: these decide where the baseline sits in a
    // CSS line box, and so where the ink lands.
    const fontAscent = metrics.fontBoundingBoxAscent;
    const fontDescent = metrics.fontBoundingBoxDescent;
    const ascent = Math.ceil(metrics.actualBoundingBoxAscent) || 1;
    const descent = Math.ceil(metrics.actualBoundingBoxDescent) || 1;
    const width = Math.max(4, Math.ceil(metrics.width) + 4);
    const height = ascent + descent + 4;

    canvas.width = width;
    canvas.height = height;
    setFont();
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, 2, ascent + 2);

    // Character boundaries, so every cell knows which letter it belongs to and
    // a reveal can still run letter by letter.
    const bounds: number[] = [];
    for (let i = 1; i <= text.length; i += 1) {
      setFont();
      bounds.push(ctx.measureText(text.slice(0, i)).width + 2);
    }

    const pixels = ctx.getImageData(0, 0, width, height).data;
    const step = cell * RENDER_PX;
    const cells: [number, number, number][] = [];

    for (let y = step / 2; y < height; y += step) {
      for (let x = step / 2; x < width; x += step) {
        if (pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] < INK) continue;
        let index = bounds.findIndex((edge) => x <= edge);
        if (index === -1) index = Math.max(0, text.length - 1);
        cells.push([x / RENDER_PX, y / RENDER_PX, index]);
      }
    }

    const baseline = (lineBox - (fontAscent + fontDescent)) / 2 + fontAscent;

    return {
      text,
      width: width / RENDER_PX,
      height: height / RENDER_PX,
      lineHeight: lineBox / RENDER_PX,
      inkTop: (baseline - ascent - 2) / RENDER_PX,
      characters: text.length,
      cells,
    };
  });
}
