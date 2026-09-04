# Hero laptop asset

The hero scene ships with a placeholder laptop built from primitives. It is a
stand-in, not the intended finish — the scene is already wired to swap it for a
real model.

## Installing the model

1. Put the file at `public/models/laptop.glb`.
2. Set `url: "/models/laptop.glb"` in `src/data/hero-model.ts`.

Nothing else needs to change. The loader scales the model to `targetWidth`,
centres it on x/z and sits it flat on the plinth, so the export's units and
origin do not matter. Body meshes are retinted to the site's graphite finish and
the display mesh is swapped for the live terminal texture.

## What to source

| Requirement | Value |
| --- | --- |
| Format | `.glb` (binary glTF 2.0), single file |
| Compression | **None.** No Draco, no meshopt — there is no decoder wired up |
| Triangles | 40k–150k. Below that the bezels and hinge read faceted; above it is wasted on a hero prop |
| File size | Under ~4 MB after texture stripping |
| Geometry | Modern thin-bezel laptop, lid open **100–110°**, real hinge, individual keycaps, a distinct trackpad |
| Orientation | Front of the laptop facing **+Z**, resting on **Y = 0**. If it faces another way, set `yawCorrection` instead of re-exporting |
| Naming | The display mesh named `Screen` or `Display`; keycaps/trackpad containing `key` / `trackpad` |
| Textures | Optional. Materials are overridden anyway, so an untextured model is fine and smaller |

## Licence

Only use something cleared for commercial use — CC0, or a purchased licence that
covers use on a public website. Record what it is below when the file lands.

- **Source:**
- **Licence:**
- **Attribution required:**

Poly Haven, the usual CC0 source, has no modern laptop (its only one is
`classic_laptop`, a vintage beige machine with a trackball), and the Khronos
sample assets have none — so this needs to come from a marketplace such as
Sketchfab, CGTrader or TurboSquid.
