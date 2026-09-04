/** Fighting Kiwi — a letterboxed frame with sprocket ticks and a timecode. */
export function CinematicVisual({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-[11%] bg-current opacity-[0.06]" />
      <div className="absolute inset-x-0 bottom-0 h-[11%] bg-current opacity-[0.06]" />

      <div className="absolute inset-x-[4%] top-[15%] flex justify-between">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="block h-2 w-px bg-current opacity-20" />
        ))}
      </div>
      <div className="absolute inset-x-[4%] bottom-[15%] flex justify-between">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="block h-2 w-px bg-current opacity-20" />
        ))}
      </div>

      {/* Focus reticle. */}
      <div className="absolute top-1/2 left-1/2 size-[22%] -translate-x-1/2 -translate-y-1/2">
        <span className="absolute top-0 left-0 h-4 w-px" style={{ backgroundColor: accent }} />
        <span className="absolute top-0 left-0 h-px w-4" style={{ backgroundColor: accent }} />
        <span className="absolute right-0 bottom-0 h-4 w-px" style={{ backgroundColor: accent }} />
        <span className="absolute right-0 bottom-0 h-px w-4" style={{ backgroundColor: accent }} />
      </div>

      <span className="label absolute bottom-[18%] left-[5%] text-current opacity-40">
        00:00:00:01
      </span>
    </div>
  );
}
