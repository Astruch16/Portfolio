/**
 * Hero laptop asset contract.
 *
 * The scene renders a built-in placeholder laptop until a real model is
 * supplied. To switch over: drop the file at `public/models/laptop.glb` and set
 * `url` below — nothing else in the scene needs to change. The model is
 * auto-fitted (scaled to `targetWidth`, centred, and sat flat on the plinth
 * surface), so it does not matter what units or origin it was exported with.
 *
 * See README-ASSETS.md for exactly what to source.
 */
export const laptopAsset = {
  /** e.g. "/models/laptop.glb". Null keeps the placeholder in play. */
  url: null as string | null,

  /** Width in world units the model is scaled to. The plinth is 4.6 across. */
  targetWidth: 1.5,

  /**
   * How the display mesh is found inside the file. Matched against mesh names,
   * so an export with a node called "Screen" or "Display" just works; if the
   * asset names it something else, add that name here.
   */
  screenMeshPattern: /screen|display|panel|lcd|monitor/i,

  /** Meshes matched here keep a matte finish instead of the aluminium one. */
  matteMeshPattern: /key|keyboard|trackpad|touchpad|rubber|foot|bezel/i,

  /** Yaw applied after auto-fit, if the model does not face +Z when exported. */
  yawCorrection: 0,
} as const;
