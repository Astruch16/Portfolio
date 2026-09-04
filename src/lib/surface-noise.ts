import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/**
 * A small tileable value-noise texture used as a roughness map on the stone
 * plinth. Perfectly uniform roughness is the main thing that makes an
 * otherwise well-lit render read as CG, and a 256px procedural tile fixes it
 * for no download and a negligible upload.
 */
export function createSurfaceNoise(
  size = 256,
  contrast = 0.22,
  repeat: [number, number] = [3, 2],
  /** Set for an albedo map; leave off for data maps like roughness. */
  srgb = false,
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);

  // Two octaves of cheap value noise: a coarse blotch for large-scale
  // variation, a fine grain for the tooth of the surface.
  const coarse = new Float32Array(size * size);
  const cells = 16;
  const grid = new Float32Array((cells + 1) * (cells + 1));
  for (let i = 0; i < grid.length; i += 1) grid[i] = Math.random();

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const gx = (x / size) * cells;
      const gy = (y / size) * cells;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const tx = gx - x0;
      const ty = gy - y0;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);

      const a = grid[y0 * (cells + 1) + x0];
      const b = grid[y0 * (cells + 1) + x0 + 1];
      const c = grid[(y0 + 1) * (cells + 1) + x0];
      const d = grid[(y0 + 1) * (cells + 1) + x0 + 1];

      coarse[y * size + x] = a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    }
  }

  for (let i = 0; i < size * size; i += 1) {
    const value = coarse[i] * 0.65 + Math.random() * 0.35;
    const level = Math.round(255 * (1 - contrast / 2 + value * contrast));
    const offset = i * 4;
    image.data[offset] = level;
    image.data[offset + 1] = level;
    image.data[offset + 2] = level;
    image.data[offset + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  if (srgb) texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Soft round falloff used for contact shadows under resting objects. */
export function createContactShadow(size = 256): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0.62)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.26)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new CanvasTexture(canvas);
}

/**
 * A soft horizontal band of light, brightest along its centre line and fading
 * to nothing at every edge.
 *
 * Used on additive planes standing just outside the plinth's faces, which is
 * how the cavity gets a halo without a bloom pass — full post-processing would
 * mean another dependency and another render target for one glowing seam.
 */
export function createGlowBand(width = 256): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width / 2;

  const ctx = canvas.getContext("2d")!;
  const height = canvas.height;

  const across = ctx.createLinearGradient(0, 0, 0, height);
  across.addColorStop(0, "rgba(114,87,255,0)");
  across.addColorStop(0.36, "rgba(126,100,255,0.32)");
  across.addColorStop(0.47, "rgba(168,146,255,0.85)");
  across.addColorStop(0.5, "rgba(214,203,255,1)");
  across.addColorStop(0.53, "rgba(168,146,255,0.85)");
  across.addColorStop(0.64, "rgba(126,100,255,0.32)");
  across.addColorStop(1, "rgba(114,87,255,0)");

  ctx.fillStyle = across;
  ctx.fillRect(0, 0, width, height);

  // Fade the ends so the band never stops abruptly at a corner.
  const along = ctx.createLinearGradient(0, 0, width, 0);
  along.addColorStop(0, "rgba(0,0,0,0)");
  along.addColorStop(0.14, "rgba(0,0,0,1)");
  along.addColorStop(0.86, "rgba(0,0,0,1)");
  along.addColorStop(1, "rgba(0,0,0,0)");

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = along;
  ctx.fillRect(0, 0, width, height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
