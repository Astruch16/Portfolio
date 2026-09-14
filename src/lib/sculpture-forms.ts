/**
 * The three forms the hero sculpture morphs between, as point clouds.
 *
 * One per line of the statement beside it:
 *
 *   0 · DESIGN — an artboard, exploded: frame, header, sidebar and cards on
 *                separate planes, a pen path drawn across them
 *   1 · BUILD  — a system in layers: three slabs with their grids, the
 *                columns between them and blocks sitting on the top one
 *   2 · SHIP   — a globe: lines of latitude and longitude, routes arcing
 *                between points on its surface, an orbit around it
 *
 * Every form is described as polylines and then sampled evenly by length, so
 * any form can be expressed at any particle count and the density along a line
 * stays constant. Each form is then shuffled on its own, so a particle's place
 * in one form has nothing to do with its place in the next — a morph sends
 * every point across the sculpture instead of sliding the shape sideways.
 *
 * Pure and deterministic: no three.js, no randomness. The 3D scene and the flat
 * fallback both read these, and draw the same sculpture every visit.
 */

export const FORMS = ["Design", "Build", "Ship"] as const;
export type FormIndex = 0 | 1 | 2;

type Vec3 = [number, number, number];
type Path = Vec3[];

/** Deterministic 0–1 hash. */
export function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const rect = (w: number, h: number, z: number, x = 0, y = 0): Path => [
  [x - w / 2, y - h / 2, z],
  [x + w / 2, y - h / 2, z],
  [x + w / 2, y + h / 2, z],
  [x - w / 2, y + h / 2, z],
  [x - w / 2, y - h / 2, z],
];

const line = (a: Vec3, b: Vec3): Path => [a, b];

function circle(cx: number, cy: number, r: number, z: number, steps = 40): Path {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as Vec3;
  });
}

/* --- 0 · Design ------------------------------------------------------------- */

function design(): Path[] {
  const paths: Path[] = [];
  // The artboard and its layers, pulled apart in depth.
  paths.push(rect(2.6, 1.8, -0.36));
  paths.push(rect(2.6, 0.26, -0.12, 0, 0.77));
  paths.push(line([-1.3, 0.64, -0.12], [-1.3, -0.9, -0.12]));
  paths.push(rect(0.52, 1.44, -0.12, -1.0, -0.14));
  for (const [y, w] of [[0.3, 0.3], [0.1, 0.36], [-0.1, 0.24], [-0.3, 0.32]] as const) {
    paths.push(line([-1.18, y, -0.12], [-1.18 + w, y, -0.12]));
  }
  // Cards, floating forward of the page.
  paths.push(rect(1.72, 0.62, 0.14, 0.34, 0.27));
  paths.push(rect(0.82, 0.66, 0.3, -0.11, -0.47));
  paths.push(rect(0.82, 0.66, 0.3, 0.79, -0.47));
  paths.push(circle(-0.38, 0.27, 0.16, 0.14));
  for (const y of [0.38, 0.2]) paths.push(line([-0.1, y, 0.14], [0.95, y, 0.14]));
  for (const x of [-0.34, -0.14, 0.06, 0.26]) paths.push(line([x, -0.7, 0.3], [x, -0.36 - hash(x) * 0.28, 0.3]));
  // A pen path swept across every layer, with its anchors.
  const pen: Path = [];
  for (let i = 0; i <= 60; i += 1) {
    const t = i / 60;
    pen.push([-1.5 + t * 3.1, 0.95 * Math.sin(t * Math.PI * 1.6 + 0.4) - 0.1, 0.52 - t * 0.2]);
  }
  paths.push(pen);
  for (const t of [0, 0.5, 1]) {
    const [x, y, z] = pen[Math.round(t * 60)];
    paths.push(rect(0.09, 0.09, z, x, y));
  }
  return paths;
}

/* --- 1 · Build -------------------------------------------------------------- */

function build(): Path[] {
  const paths: Path[] = [];
  const W = 2.1;
  const D = 1.3;
  const slab = (y: number): Path => [
    [-W / 2, y, -D / 2],
    [W / 2, y, -D / 2],
    [W / 2, y, D / 2],
    [-W / 2, y, D / 2],
    [-W / 2, y, -D / 2],
  ];
  for (const y of [-0.72, 0, 0.72]) {
    paths.push(slab(y));
    // The layer's own grid.
    for (let k = 1; k < 6; k += 1) {
      const x = -W / 2 + (W * k) / 6;
      paths.push(line([x, y, -D / 2], [x, y, D / 2]));
    }
    for (let k = 1; k < 4; k += 1) {
      const z = -D / 2 + (D * k) / 4;
      paths.push(line([-W / 2, y, z], [W / 2, y, z]));
    }
  }
  // Columns carrying each layer on the one below.
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2], [0, 0]] as const) {
    paths.push(line([x, -0.72, z], [x, 0.72, z]));
  }
  // Blocks standing on the top layer.
  for (const [x, z, h] of [[-0.6, -0.2, 0.34], [0.05, 0.25, 0.52], [0.62, -0.18, 0.24]] as const) {
    const s = 0.24;
    const y0 = 0.72;
    const y1 = 0.72 + h;
    for (const y of [y0, y1]) {
      paths.push([[x - s, y, z - s], [x + s, y, z - s], [x + s, y, z + s], [x - s, y, z + s], [x - s, y, z - s]]);
    }
    for (const [dx, dz] of [[-s, -s], [s, -s], [s, s], [-s, s]]) {
      paths.push(line([x + dx, y0, z + dz], [x + dx, y1, z + dz]));
    }
  }
  return paths.map((p) => p.map(([x, y, z]) => [x, y - 0.14, z] as Vec3));
}

/* --- 2 · Ship --------------------------------------------------------------- */

function ship(): Path[] {
  const paths: Path[] = [];
  const R = 1.08;
  const on = (lat: number, lon: number, r = R): Vec3 => [
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.sin(lon),
  ];

  for (let k = -3; k <= 3; k += 1) {
    const lat = (k / 4) * (Math.PI / 2);
    paths.push(Array.from({ length: 65 }, (_, i) => on(lat, (i / 64) * Math.PI * 2)));
  }
  for (let k = 0; k < 8; k += 1) {
    const lon = (k / 8) * Math.PI;
    paths.push(Array.from({ length: 65 }, (_, i) => on(-Math.PI / 2 + (i / 64) * Math.PI, lon)));
  }

  // Routes between places on the surface, lifted off it as they travel.
  const places: [number, number][] = [
    [0.5, 0.3], [0.2, 1.6], [-0.4, 2.6], [0.7, -2.4], [-0.2, -1.1], [0.1, 3.8],
  ];
  for (let k = 0; k < places.length; k += 1) {
    const [la1, lo1] = places[k];
    const [la2, lo2] = places[(k + 2) % places.length];
    paths.push(
      Array.from({ length: 41 }, (_, i) => {
        const t = i / 40;
        return on(la1 + (la2 - la1) * t, lo1 + (lo2 - lo1) * t, R + Math.sin(t * Math.PI) * 0.34);
      }),
    );
  }

  // The orbit, tilted, and what's travelling on it.
  const tilt = 0.42;
  paths.push(
    Array.from({ length: 97 }, (_, i) => {
      const a = (i / 96) * Math.PI * 2;
      const x = Math.cos(a) * 1.62;
      const z = Math.sin(a) * 1.62;
      return [x, z * Math.sin(tilt), z * Math.cos(tilt)] as Vec3;
    }),
  );
  paths.push(circle(1.62, 0, 0.07, 0, 16));
  return paths;
}

/* --- Sampling --------------------------------------------------------------- */

function sample(paths: Path[], count: number, salt: number): Float32Array {
  const segments: { a: Vec3; b: Vec3; start: number; length: number }[] = [];
  let total = 0;
  for (const path of paths) {
    for (let i = 1; i < path.length; i += 1) {
      const a = path[i - 1];
      const b = path[i];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      segments.push({ a, b, start: total, length });
      total += length;
    }
  }

  const points = new Float32Array(count * 3);
  let s = 0;
  for (let i = 0; i < count; i += 1) {
    const distance = ((i + hash(i + salt) * 0.8) / count) * total;
    while (s < segments.length - 1 && segments[s].start + segments[s].length < distance) s += 1;
    const { a, b, start, length } = segments[s];
    const t = length ? Math.min(1, (distance - start) / length) : 0;
    // A hair of scatter off the line, so it reads as particles rather than as
    // a stroke.
    const j = 0.012;
    points[i * 3] = a[0] + (b[0] - a[0]) * t + (hash(i * 3 + salt) - 0.5) * j;
    points[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + (hash(i * 5 + salt) - 0.5) * j;
    points[i * 3 + 2] = a[2] + (b[2] - a[2]) * t + (hash(i * 7 + salt) - 0.5) * j;
  }

  // Shuffle, so this form's order is unrelated to every other form's.
  const order = Array.from({ length: count }, (_, i) => i).sort(
    (p, q) => hash(p * 1.7 + salt) - hash(q * 1.7 + salt),
  );
  const shuffled = new Float32Array(count * 3);
  order.forEach((from, to) => {
    shuffled.set(points.subarray(from * 3, from * 3 + 3), to * 3);
  });
  return shuffled;
}

/** All three forms at `count` particles each, in FORMS order. */
export function buildForms(count: number): [Float32Array, Float32Array, Float32Array] {
  return [sample(design(), count, 11), sample(build(), count, 23), sample(ship(), count, 37)];
}
