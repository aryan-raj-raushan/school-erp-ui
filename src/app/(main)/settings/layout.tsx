"use client";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Nav, NavItem } from "@/components/ui/nav";
import { SectionLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { SETTINGS_ITEMS } from "@/constants/settings";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const isIndex = pathname === "/settings";

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left sidebar (hidden on overview /settings) ─────────────── */}
      {!isIndex && (
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-card h-screen sticky top-0">
          {/* Back to overview */}
          <div className="px-4 py-4 border-b border-border">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              All Settings
            </Link>
          </div>

          {/* Nav items */}
          <Nav className="py-3">
            <SectionLabel className="px-3 mb-2">Settings</SectionLabel>
            {SETTINGS_ITEMS.map((item) => {
              const href = `/settings/${item.slug}`;
              const active = pathname === href;
              return (
                <NavItem
                  key={item.slug}
                  href={href}
                  active={active}
                  icon={<item.icon size={16} />}
                >
                  {item.label}
                </NavItem>
              );
            })}
          </Nav>
        </aside>
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main
        className={cn(
          "flex-1 overflow-y-auto p-6 md:p-8",
          !isIndex && "max-w-4xl",
        )}
      >
        {children}
      </main>
    </div>
  );
}
