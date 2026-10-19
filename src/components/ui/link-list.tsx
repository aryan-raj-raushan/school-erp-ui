"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { haptic } from "@/lib/haptics";

export interface LinkListItem {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
}

/**
 * Settings-style menu: one rounded card of tappable rows, each with an icon
 * tile, a label, an optional description and a chevron.
 */
export function LinkList({ items }: { items: ReadonlyArray<LinkListItem> }) {
  return (
    <ul className="overflow-hidden rounded-3xl border border-border/60 bg-white dark:bg-neutral-900">
      {items.map((item, index) => (
        <li key={item.href} className={index > 0 ? "border-t border-border/50" : undefined}>
          <Link
            href={item.href}
            onClick={() => void haptic("light")}
            className="flex min-h-[68px] items-center gap-3.5 px-4 py-3 active:bg-muted/60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-text">
              <item.icon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{item.label}</span>
              {item.description && (
                <span className="block truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </span>
            <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
