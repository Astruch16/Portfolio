import { CanvasTexture, SRGBColorSpace } from "three";

import {
  compileScript,
  frameAt,
  type Segment,
  type TerminalFrame,
  type Tone,
} from "@/data/terminal-script";

/**
 * Draws the terminal script to an offscreen canvas and hands back a texture.
 *
 * A canvas texture rather than a perspective-matched HTML overlay: the overlay
 * approach has to re-project the screen quad every frame, can't be occluded by
 * the laptop it sits on, and drifts the moment the camera moves. At 1024×640 on
 * a screen that occupies roughly 400 CSS pixels the text is comfortably
 * oversampled, and the draw only runs when something actually changed — around
 * twice a second once the script settles, for the cursor blink.
 *
 * Nothing in here knows what the terminal says; that lives in
 * `data/terminal-script.ts`.
 */

const WIDTH = 1024;
const HEIGHT = 640;
const CHROME_HEIGHT = 38;
const PADDING_X = 30;
const PADDING_TOP = 14;
const FONT_SIZE = 21;
const LINE_HEIGHT = 31;
const BLINK_MS = 540;

const BACKGROUND = "#08080c";
const CHROME = "#0d0d13";
const HAIRLINE = "rgba(255,255,255,0.07)";

const TONE_COLOR: Record<Tone, string> = {
  text: "#e6e6ea",
  muted: "#6f6f7d",
  accent: "#8b79ff",
  success: "#b6e53b",
  prompt: "#8b79ff",
};

export type TerminalTexture = {
  texture: CanvasTexture;
  /** Advance to `elapsedMs`; pass `instant` to jump to the settled state. */
  update: (elapsedMs: number, instant?: boolean) => void;
  duration: number;
  dispose: () => void;
};

function monoFamily(): string {
  if (typeof window === "undefined") return "monospace";
  const declared = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-mono")
    .trim();
  return declared || "ui-monospace, SFMono-Regular, Menlo, monospace";
}

export function createTerminalTexture(): TerminalTexture {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext("2d", { alpha: false })!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const compiled = compileScript();
  let family = monoFamily();
  let signature = "";

  // The variable font may still be loading on first paint; redraw once it
  // lands so the first frames aren't set in the fallback face.
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(() => {
      family = monoFamily();
      signature = "";
    });
  }

  // Weights must be multiples of 100: the CSS `font` shorthand rejects values
  // like 450 outright, and a rejected assignment silently leaves the context on
  // its 10px sans-serif default.
  const setFont = (weight: 400 | 500) => {
    ctx.font = `${weight} ${FONT_SIZE}px ${family}`;
  };

  function drawSegments(segments: Segment[], y: number) {
    let x = PADDING_X;

    for (const segment of segments) {
      ctx.fillStyle = TONE_COLOR[segment.tone ?? "text"];
      setFont(segment.tone === "muted" ? 400 : 500);
      ctx.fillText(segment.text, x, y);
      x += ctx.measureText(segment.text).width;
    }

    return x;
  }

  function draw(frame: TerminalFrame, blinkOn: boolean) {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Window chrome: neutral dots rather than traffic lights, which would read
    // as somebody else's operating system.
    ctx.fillStyle = CHROME;
    ctx.fillRect(0, 0, WIDTH, CHROME_HEIGHT);
    ctx.fillStyle = HAIRLINE;
    ctx.fillRect(0, CHROME_HEIGHT - 1, WIDTH, 1);

    // A single right-aligned label with a live dot, rather than traffic
    // lights, which would read as somebody else's operating system.
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillStyle = "#5b5b68";
    ctx.font = `400 14px ${family}`;
    ctx.fillText("TERMINAL", WIDTH - PADDING_X - 18, CHROME_HEIGHT / 2 + 1);
    ctx.textAlign = "left";

    ctx.fillStyle = "#b6e53b";
    ctx.beginPath();
    ctx.arc(WIDTH - PADDING_X - 5, CHROME_HEIGHT / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.textBaseline = "alphabetic";

    let caretX = PADDING_X;
    let caretY = CHROME_HEIGHT + PADDING_TOP + LINE_HEIGHT;

    frame.lines.forEach((segments, row) => {
      const y = CHROME_HEIGHT + PADDING_TOP + (row + 1) * LINE_HEIGHT;
      const endX = drawSegments(segments, y);
      if (row === frame.caretRow) {
        caretX = endX;
        caretY = y;
      }
    });

    if (blinkOn) {
      setFont(500);
      const cell = ctx.measureText("M").width;
      ctx.fillStyle = TONE_COLOR.text;
      ctx.fillRect(caretX + 1, caretY - FONT_SIZE + 3, cell, FONT_SIZE);
    }
  }

  function update(elapsedMs: number, instant = false) {
    const t = instant ? compiled.duration : elapsedMs;
    const frame = frameAt(compiled, t);
    const blinkOn = instant
      ? true
      : Math.floor(elapsedMs / BLINK_MS) % 2 === 0;

    // Content is monotonic, so line count plus caret column identifies it.
    const next = `${frame.lines.length}|${frame.caretCol}|${blinkOn}`;
    if (next === signature) return;

    signature = next;
    draw(frame, blinkOn);
    texture.needsUpdate = true;
  }

  return {
    texture,
    update,
    duration: compiled.duration,
    /**
     * Frees the GPU copy only. Deliberately leaves the handle usable: React
     * StrictMode mounts, unmounts and remounts in development, so a latched
     * "disposed" flag here would silently kill the terminal for the entire
     * session. Clearing the signature forces a redraw — and therefore a
     * re-upload — if the same handle comes back to life.
     */
    dispose: () => {
      signature = "";
      texture.dispose();
    },
  };
}
