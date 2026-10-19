"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import {
  BottomSheet,
  LinkList,
  MobileTabButton,
  MobileTabLabel,
  MobileTabLink,
} from "@/components/ui";
import {
  PARENT_NAV_MAIN,
  PARENT_NAV_TABS,
} from "@/constants/layout/app-parent-nav.constants";
import { ROUTES } from "@/constants";
import { haptic } from "@/lib/haptics";

const PILL_STYLE = {
  background:
    "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))",
};

function isActivePath(pathname: string, url: string) {
  const clean = pathname.replace(/\/$/, "");
  return url === ROUTES.parentPortal ? clean === url : clean === url || clean.startsWith(`${url}/`);
}

/**
 * Bottom tab bar for the parent portal. The first tabs are the key pages;
 * "More" opens a sheet with every remaining page and Log out, so nothing in
 * the portal is unreachable on a phone.
 */
export function ParentTabBar({
  onLogout,
  isLoggingOut,
}: {
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const tabUrls = new Set(PARENT_NAV_TABS.map((t) => t.url));
  const moreItems = PARENT_NAV_MAIN.filter((item) => !tabUrls.has(item.url));
  const moreActive = moreItems.some((item) => isActivePath(pathname, item.url));

  return (
    <>
      <nav
        data-native-chrome
        className="flex shrink-0 items-stretch border-t border-border bg-background px-1 pt-1"
        style={{ paddingBottom: 4 }}
        aria-label="Primary"
      >
        {PARENT_NAV_TABS.map((tab) => {
          const active = isActivePath(pathname, tab.url);
          return (
            <MobileTabLink key={tab.url} href={tab.url} active={active}>
              <span className="relative flex h-8 w-14 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="parent-tab-pill"
                    className="absolute inset-0 rounded-full"
                    style={PILL_STYLE}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <tab.icon
                  size={21}
                  className="relative"
                  style={active ? { color: "var(--theme-active-text)" } : undefined}
                />
              </span>
              <MobileTabLabel active={active}>{tab.title.split(" ")[0]}</MobileTabLabel>
            </MobileTabLink>
          );
        })}

        <MobileTabButton
          active={moreActive || moreOpen}
          onClick={() => {
            void haptic("light");
            setMoreOpen(true);
          }}
          aria-label="More"
        >
          <span className="relative flex h-8 w-14 items-center justify-center">
            {(moreActive || moreOpen) && (
              <span className="absolute inset-0 rounded-full" style={PILL_STYLE} />
            )}
            <MoreHorizontal
              size={21}
              className="relative"
              style={moreActive || moreOpen ? { color: "var(--theme-active-text)" } : undefined}
            />
          </span>
          <MobileTabLabel active={moreActive}>More</MobileTabLabel>
        </MobileTabButton>
      </nav>
      <div aria-hidden className="shrink-0 bg-background" style={{ height: "var(--sab)" }} />

      <BottomSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <div onClick={() => setMoreOpen(false)} className="flex flex-col gap-3 pb-2">
          <LinkList
            items={moreItems.map((item) => ({
              href: item.url,
              label: item.title,
              icon: item.icon,
            }))}
          />
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onLogout}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 text-[15px] font-semibold text-destructive active:bg-destructive/20 disabled:opacity-60"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
