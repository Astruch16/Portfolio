/**
 * The three forms the hero sculpture morphs between, as point clouds.
 *
 * Each is also the verb of the statement beside it — I design it, I build it,
 * I ship it, I code it, I measure it, I iterate it — so the names are verbs:
 *
 *   0 · DESIGN  — an artboard, exploded: frame, header, sidebar and cards on
 *                 separate planes, a pen path drawn across them
 *   1 · BUILD   — a system in layers: three slabs with their grids, the
 *                 columns between them and blocks sitting on the top one
 *   2 · SHIP    — a globe: lines of latitude and longitude, routes arcing
 *                 between points on its surface, an orbit around it
 *   3 · CODE    — `</>`, extruded, in front of the faint lines of a file
 *   4 · MEASURE — a wave surface, measured: a mesh with markers standing on it
 *   5 · ITERATE — a trefoil knot, three strands wide: a loop with no end
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

export const FORMS = ["Design", "Build", "Ship", "Code", "Measure", "Iterate"] as const;
export type FormIndex = 0 | 1 | 2 | 3 | 4 | 5;

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
  for (const [x, z, h] of [[-0.6, -0.2, 0.3], [0.05, 0.25, 0.42], [0.62, -0.18, 0.22]] as const) {
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
  return tilt(paths.map((p) => p.map(([x, y, z]) => [x, y - 0.26, z] as Vec3)), 0.3);
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

/**
 * Leans a form back so its top faces the viewer a little.
 *
 * The sculpture rests square-on to the viewer. That suits the upright forms and
 * flattens the level ones: seen dead level, the slabs of Build and the surface
 * of Measure collapse into a few horizontal lines. Tilting just those two
 * toward the eye keeps them front-on while still showing what's on top.
 */
function tilt(paths: Path[], angle: number): Path[] {
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  return paths.map((path) => path.map(([x, y, z]) => [x, y * c - z * s, y * s + z * c] as Vec3));
}

/* --- 3 · Code --------------------------------------------------------------- */

function code(): Path[] {
  const paths: Path[] = [];
  const DEPTH = 0.09;

  // One stroke of a glyph, drawn as a solid bar: its outline front and back
  // and the four edges joining them.
  const bar = (a: [number, number], b: [number, number], t = 0.24) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const nx = (-dy / len) * (t / 2);
    const ny = (dx / len) * (t / 2);
    const corners: [number, number][] = [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ];
    for (const z of [DEPTH, -DEPTH]) {
      paths.push([...corners, corners[0]].map(([x, y]) => [x, y, z] as Vec3));
    }
    for (const [x, y] of corners) paths.push(line([x, y, DEPTH], [x, y, -DEPTH]));
  };

  bar([-0.5, 0.66], [-1.34, 0]);
  bar([-1.34, 0], [-0.5, -0.66]);
  bar([0.5, 0.66], [1.34, 0]);
  bar([1.34, 0], [0.5, -0.66]);
  bar([0.3, 0.9], [-0.3, -0.9]);

  // The file behind it.
  const rows: [number, number][] = [[1.02, 0.7], [0.8, 1.2], [-0.8, 1.4], [-1.02, 0.8]];
  for (const [y, w] of rows) {
    const indent = hash(y * 10) < 0.5 ? 0 : 0.25;
    paths.push(line([-1.45 + indent, y, -0.42], [-1.45 + indent + w, y, -0.42]));
  }
  return paths;
}

/* --- 4 · Data --------------------------------------------------------------- */

function data(): Path[] {
  const paths: Path[] = [];
  const height = (x: number, z: number) =>
    0.3 * Math.sin(1.7 * x + 0.6) * Math.cos(1.8 * z) + 0.16 * Math.sin(2.9 * x - 1.4 * z) - 0.3;
  const X = 1.45;
  const Z = 1.0;

  for (let r = 0; r <= 9; r += 1) {
    const z = -Z + (2 * Z * r) / 9;
    paths.push(Array.from({ length: 49 }, (_, i) => {
      const x = -X + (2 * X * i) / 48;
      return [x, height(x, z), z] as Vec3;
    }));
  }
  for (let c = 0; c <= 13; c += 1) {
    const x = -X + (2 * X * c) / 13;
    paths.push(Array.from({ length: 33 }, (_, i) => {
      const z = -Z + (2 * Z * i) / 32;
      return [x, height(x, z), z] as Vec3;
    }));
  }

  // Markers standing on the surface, each with a reading ring at the top.
  for (const [x, z] of [[-0.9, -0.3], [-0.2, 0.45], [0.55, -0.55], [1.05, 0.3]] as const) {
    const y0 = height(x, z);
    const y1 = y0 + 0.5 + hash(x + z) * 0.3;
    paths.push(line([x, y0, z], [x, y1, z]));
    paths.push(circle(x, y1 + 0.09, 0.09, z, 20));
  }
  return tilt(paths, 0.36);
}

/* --- 5 · Iterate ------------------------------------------------------------ */

function iterate(): Path[] {
  const paths: Path[] = [];
  const knot = (t: number, offset: number): Vec3 => {
    const r = 0.78 + 0.34 * Math.cos(3 * t) + offset;
    return [r * Math.cos(2 * t), r * Math.sin(2 * t) - 0.02, 0.5 * Math.sin(3 * t) + offset * 0.8];
  };
  for (const offset of [-0.07, 0, 0.07]) {
    paths.push(Array.from({ length: 241 }, (_, i) => knot((i / 240) * Math.PI * 2, offset)));
  }
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

/** Every form at `count` particles each, in FORMS order. */
export function buildForms(count: number): Float32Array[] {
  return [design, build, ship, code, data, iterate].map((form, i) => sample(form(), count, 11 + i * 13));
}
