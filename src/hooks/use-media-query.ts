"use client";

import { useEffect, useState } from "react";

/**
 * Media query as state. Starts `false` on the server and on first paint, so
 * callers should treat `true` as "definitely matches" — never gate essential
 * content on it, only progressive enhancement.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);

    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}
