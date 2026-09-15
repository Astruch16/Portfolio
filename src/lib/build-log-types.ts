import type { BuildLogType } from "@/data/build-log";

/**
 * How each kind of build-log entry is labelled and coloured. Shared by the
 * build log's feed and the homepage's latest entries, so a "Fix" is the same
 * amber wherever it appears.
 */
export const TYPE_META: Record<BuildLogType, { badge: string; filter: string; color: string }> = {
  ship: { badge: "Ship", filter: "Shipped", color: "#b6e53b" },
  build: { badge: "Build", filter: "Build", color: "#7257ff" },
  fix: { badge: "Fix", filter: "Fix", color: "#f5b74a" },
  learn: { badge: "Learn", filter: "Learn", color: "#22d3ee" },
  experiment: { badge: "Experiment", filter: "Experiment", color: "#8b5cf6" },
  decision: { badge: "Decision", filter: "Decision", color: "#e6e6ea" },
};
