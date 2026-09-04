import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DrawLine } from "@/components/motion/reveal";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <section
      data-surface="dark"
      className="relative flex min-h-svh flex-col justify-end bg-bg pb-[clamp(3rem,10vh,7rem)] text-fg"
    >
      <div className="shell shell-grid items-end gap-y-8">
        <p className="label col-span-12 text-faint lg:col-span-3">
          Error / 404
        </p>

        <div className="col-span-12 lg:col-span-9">
          <h1 className="display text-section">
            Nothing
            <br />
            here yet.
          </h1>
          <DrawLine className="mt-10 mb-6" />
          <Link
            href="/"
            className="group label inline-flex items-center gap-3 text-muted transition-colors hover:text-fg"
          >
            Back to the start
            <ArrowRight
              aria-hidden
              strokeWidth={1.5}
              className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
