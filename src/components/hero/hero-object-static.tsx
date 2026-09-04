import { compileScript, frameAt, type Tone } from "@/data/terminal-script";
import { cn } from "@/lib/utils";

/**
 * The hero object without WebGL.
 *
 * Used on small screens and whenever the visitor prefers reduced motion, which
 * means three.js is never downloaded in those cases. The terminal is the same
 * script the 3D scene runs, resolved to its finished state and rendered as real
 * text — so reduced-motion visitors get the outcome immediately, at native
 * sharpness, with no typing sequence.
 *
 * Perspective is declared inside each `transform` rather than on an ancestor;
 * the `perspective` property only reaches direct children and these layers are
 * nested.
 */

const TONE_CLASS: Record<Tone, string> = {
  text: "text-[#e6e6ea]",
  muted: "text-[#6f6f7d]",
  accent: "text-[#8b79ff]",
  success: "text-[#b6e53b]",
  prompt: "text-[#8b79ff]",
};

export function HeroObjectStatic({ className }: { className?: string }) {
  // Same source of truth as the 3D scene, wound forward to the end.
  const frame = frameAt(compileScript(), Number.MAX_SAFE_INTEGER);

  return (
    <div aria-hidden className={cn("relative isolate", className)}>
      {/* Light pooling under the plinth. */}
      <div
        className="absolute right-[12%] bottom-[1%] left-[12%] h-[13%] rounded-[50%] blur-[24px]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(114,87,255,0.85) 0%, rgba(114,87,255,0.22) 46%, rgba(114,87,255,0) 74%)",
        }}
      />

      {/* Plinth. Drawn in elevation rather than fake perspective: at this size
          a stack of clean bars reads as a floating set piece, where a rotated
          plane just reads as a wedge. */}
      <div
        className="absolute inset-x-[6%] bottom-[9%] h-[7.5%] rounded-[1px]"
        style={{
          background: "linear-gradient(180deg,#faf8f4 0%,#d9d5cd 42%,#a7a29a 100%)",
          boxShadow: "0 14px 26px rgba(0,0,0,0.16)",
        }}
      />
      <div
        className="absolute inset-x-[9%] bottom-[6%] h-[1.8%]"
        style={{ background: "#7257ff", boxShadow: "0 0 26px rgba(114,87,255,0.95)" }}
      />
      <div
        className="absolute inset-x-[12%] bottom-[2.5%] h-[3%] rounded-[1px]"
        style={{ background: "linear-gradient(180deg,#1b1c21 0%,#08080a 100%)" }}
      />

      {/* Laptop */}
      <div className="absolute bottom-[16%] left-[9%] w-[56%]">
        {/* Lid */}
        <div
          className="rounded-[3px] p-[3.5%]"
          style={{
            background: "linear-gradient(160deg,#2a2b30 0%,#17181b 60%,#101114 100%)",
            boxShadow: "0 18px 34px rgba(0,0,0,0.32)",
          }}
        >
          <div className="overflow-hidden rounded-[1px] bg-[#08080c]">
            <div className="flex items-center gap-[3px] bg-[#0d0d13] px-[3%] py-[1.6%]">
              <span className="block size-[3px] rounded-full bg-white/15" />
              <span className="block size-[3px] rounded-full bg-white/15" />
              <span className="block size-[3px] rounded-full bg-white/15" />
            </div>
            <div className="px-[3.5%] py-[2.5%] font-mono text-[clamp(4px,1.35vw,8px)] leading-[1.55]">
              {frame.lines.map((segments, row) => (
                <div key={row} className="whitespace-pre">
                  {segments.length === 0
                    ? " "
                    : segments.map((segment, index) => (
                        <span key={index} className={TONE_CLASS[segment.tone ?? "text"]}>
                          {segment.text}
                        </span>
                      ))}
                  {row === frame.caretRow ? (
                    <span className="ml-px inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-[#e6e6ea]" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Deck */}
        <div
          className="mx-[-6%] h-[7px] rounded-b-[3px]"
          style={{
            transform: "perspective(500px) rotateX(58deg)",
            transformOrigin: "top",
            background: "linear-gradient(180deg,#26272c 0%,#141519 100%)",
          }}
        />
      </div>

      {/* Sphere */}
      <div className="absolute right-[11%] bottom-[16%] aspect-square w-[20%]">
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 27%, #4e4e56 0%, #191a1e 20%, #09090b 54%, #050505 100%)",
            boxShadow:
              "inset -5px -7px 20px rgba(114,87,255,0.18), inset 7px 9px 16px rgba(255,255,255,0.05), 0 16px 30px rgba(0,0,0,0.3)",
          }}
        />
        <div
          className="absolute top-[17%] left-[27%] h-[8%] w-[11%] rounded-full blur-[1px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 72%)",
          }}
        />
      </div>

      {/* Contact shadow under the sphere. */}
      <div
        className="absolute right-[12%] bottom-[14.5%] h-[2.4%] w-[18%] rounded-[50%] blur-[5px]"
        style={{ background: "rgba(0,0,0,0.34)" }}
      />
    </div>
  );
}
