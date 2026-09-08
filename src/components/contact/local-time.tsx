"use client";

import { useEffect, useState } from "react";

/**
 * Adam's local clock.
 *
 * A small honesty: "Chilliwack, BC" is a claim, but a clock ticking in
 * America/Vancouver is checkable — a visitor can see instantly whether they're
 * writing into someone's working day or their night.
 *
 * Renders nothing on the server and fills in after mount. The alternative —
 * formatting a time during render — bakes the build time into a static page and
 * hands the client different markup than the server produced.
 */
export function LocalTime({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const tick = () => setNow(format.format(new Date()));
    tick();

    // Aligned to the next minute boundary, then every minute — a per-second
    // interval would re-render sixty times for a display that shows minutes.
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [timezone]);

  return (
    <span suppressHydrationWarning>
      {now ? `${now} local` : "—"}
    </span>
  );
}
