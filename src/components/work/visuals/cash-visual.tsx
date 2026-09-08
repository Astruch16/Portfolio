/** Lively Cash — a terminal face and the notes it dispenses. */
export function CashVisual({ accent }: { accent: string }) {
  // Fixed values rather than random ones: the same drawing has to render
  // identically on the server and on the client.
  const notes = [86, 70, 78];
  // The key that lights up. Bottom-right of a 3x4 pad — where "enter" sits.
  const LIVE_KEY = 11;

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-[7%]" aria-hidden>
      {/* The terminal. Aspect-locked so the screen, pad and slots keep their
          proportions to each other whatever ratio the frame is. */}
      <div className="flex aspect-[5/7] h-[72%] flex-col gap-[5%]">
        <div
          className="flex flex-[0_0_30%] flex-col justify-end gap-[7%] p-[7%]"
          style={{ border: "1px solid currentColor", borderColor: "rgb(255 255 255 / 0.22)" }}
        >
          <span className="block h-px w-[64%] bg-current opacity-30" />
          <span className="block h-px w-[40%] bg-current opacity-30" />
        </div>

        <div className="grid flex-1 grid-cols-3 gap-[6%]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="block rounded-[1px]"
              style={
                i === LIVE_KEY
                  ? { backgroundColor: accent }
                  : { border: "1px solid rgb(255 255 255 / 0.2)" }
              }
            />
          ))}
        </div>

        {/* Card slot, then the wider dispenser under it. */}
        <div className="flex flex-[0_0_auto] flex-col gap-[6px]">
          <span className="block h-px w-[44%] bg-current opacity-30" />
          <span className="block h-px w-full" style={{ backgroundColor: accent, opacity: 0.9 }} />
        </div>
      </div>

      {/* What comes out of it. */}
      <div className="flex h-[72%] w-[26%] flex-col justify-center gap-[7%]">
        {notes.map((width, i) => (
          <div key={width} className="flex items-center gap-2.5">
            <span
              className="block h-3 w-px shrink-0"
              style={{
                backgroundColor: i === 0 ? accent : "currentColor",
                opacity: i === 0 ? 1 : 0.28,
              }}
            />
            <span
              className="block h-[1.15rem] rounded-[1px]"
              style={{ width: `${width}%`, border: "1px solid rgb(255 255 255 / 0.18)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
