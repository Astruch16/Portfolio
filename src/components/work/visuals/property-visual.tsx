/** TruHost — a property plate beside its management rail. */
export function PropertyVisual({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex items-stretch gap-[5%] p-[7%]" aria-hidden>
      <div className="relative flex-1 border border-current/25">
        <span className="absolute inset-[10%] border border-current/12" />
        <span
          className="absolute bottom-[10%] left-[10%] block h-px w-[30%]"
          style={{ backgroundColor: accent }}
        />
      </div>

      <div className="flex w-[26%] flex-col justify-between py-[3%]">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span
              className="block size-1.5 rounded-full"
              style={{
                backgroundColor: row === 1 ? accent : "currentColor",
                opacity: row === 1 ? 1 : 0.25,
              }}
            />
            <span className="block h-px flex-1 bg-current opacity-25" />
          </div>
        ))}
      </div>
    </div>
  );
}
