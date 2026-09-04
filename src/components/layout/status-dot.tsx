import { cn } from "@/lib/utils";

/**
 * The site's only ambient animation: a slow breath on the availability light.
 * It stops entirely under `prefers-reduced-motion` (handled in globals.css).
 */
export function StatusDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("signal-dot", className)} />;
}
