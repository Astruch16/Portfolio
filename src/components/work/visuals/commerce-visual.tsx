/** My Local Loop — a scan block and the offers that come back from it. */
export function CommerceVisual({ accent }: { accent: string }) {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 37) % 11 < 5);

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-[6%] px-[8%]" aria-hidden>
      <div className="grid aspect-square w-[34%] shrink-0 grid-cols-7 gap-[3%]">
        {cells.map((filled, i) => (
          <span
            key={i}
            className="block rounded-[1px]"
            style={{
              backgroundColor: filled ? "currentColor" : "transparent",
              opacity: filled ? (i % 5 === 0 ? 0.85 : 0.3) : 0,
            }}
          />
        ))}
      </div>

      <div className="flex w-[46%] flex-col gap-[8%]">
        {[92, 68, 80].map((width, i) => (
          <div key={width} className="flex items-center gap-3">
            <span
              className="block h-6 w-px"
              style={{ backgroundColor: i === 0 ? accent : "currentColor", opacity: i === 0 ? 1 : 0.28 }}
            />
            <span
              className="block h-px"
              style={{ width: `${width}%`, backgroundColor: "currentColor", opacity: 0.28 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
