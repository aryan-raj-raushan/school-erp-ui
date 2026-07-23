"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_ITEMS } from "@/constants/settings";
import { cn } from "@/lib/utils";

export function MobileSettingsNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden border-b border-border bg-background">
      <div className="flex gap-6 overflow-x-auto px-4 no-scrollbar">
        {SETTINGS_ITEMS.map((item) => {
          const href = `/settings/${item.slug}/`;
          const active = pathname === href;
          return (
            <Link
              key={item.slug}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 shrink-0 border-b-2 transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <item.icon
                size={20}
                className={active ? "text-foreground" : "text-muted-foreground"}
              />
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  active ? "font-semibold" : "font-normal",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
