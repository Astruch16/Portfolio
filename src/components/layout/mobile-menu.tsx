"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, VisuallyHidden } from "radix-ui";
import { useState } from "react";

import { StatusDot } from "@/components/layout/status-dot";
import { navItems, site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Full-bleed menu built on the Radix Dialog primitive — focus trap, scroll
 * lock, escape handling and `aria-modal` come for free; every pixel of the
 * appearance is ours. The panel wipes in from its top edge with a clip-path
 * rather than sliding, so the type reads as being uncovered.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] text-fg"
        >
          <span className="block h-px w-5 bg-current" />
          <span className="block h-px w-5 bg-current" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-void/50 data-closed:animate-[menu-overlay-out_240ms_var(--ease-out-quart)_both] data-open:animate-[menu-overlay-in_240ms_var(--ease-out-quart)_both]" />

        <Dialog.Content
          data-surface="dark"
          className="fixed inset-0 z-50 flex flex-col bg-bg text-fg data-closed:animate-[menu-panel-out_420ms_var(--ease-in-out-quart)_both] data-open:animate-[menu-panel-in_560ms_var(--ease-out-expo)_both]"
        >
          <VisuallyHidden.Root>
            <Dialog.Title>Site navigation</Dialog.Title>
          </VisuallyHidden.Root>

          <div className="shell flex h-(--nav-h) shrink-0 items-center justify-between">
            <span className="font-mono text-sm font-medium tracking-tight">
              {site.monogram}
            </span>
            <Dialog.Close
              aria-label="Close menu"
              className="-mr-2 flex h-11 w-11 items-center justify-center"
            >
              <span className="relative block h-5 w-5">
                <span className="absolute top-1/2 left-0 block h-px w-5 rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 block h-px w-5 -rotate-45 bg-current" />
              </span>
            </Dialog.Close>
          </div>

          <nav aria-label="Primary" className="shell flex flex-1 flex-col justify-center">
            <ul>
              {navItems.map((item, index) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li
                    key={item.href}
                    style={{ animationDelay: `${index * 55 + 140}ms` }}
                    className="animate-[menu-item-in_680ms_var(--ease-out-expo)_both] border-b border-hairline first:border-t"
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-5 py-5"
                    >
                      <span
                        className={cn(
                          "label",
                          active ? "text-signal" : "text-faint",
                        )}
                      >
                        {item.index}
                      </span>
                      <span className="display text-[clamp(2.25rem,11vw,3.5rem)]">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            style={{ animationDelay: "440ms" }}
            className="shell flex animate-[menu-item-in_680ms_var(--ease-out-expo)_both] items-end justify-between pb-8"
          >
            <p className="label text-faint">
              {site.location.city}
              <br />
              {site.location.country}
            </p>
            <p className="label flex items-center gap-2 text-muted">
              <StatusDot />
              {site.status.label}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
