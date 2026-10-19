"use client";

import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavItems } from "@/hooks/useNavItems";
import { MobileTabLink, MobileTabButton, MobileTabLabel } from "@/components/ui/mobile-nav";
import { useAuthStore } from "@/store/auth.store";
import { MOBILE_TAB_HIDDEN_ROLES } from "@/constants/mobile-nav.constants";

export function MobileTabBar() {
  const { tabs, isActive } = useNavItems();
  const { toggleSidebar, openMobile } = useSidebar();

  const role = useAuthStore((s) => s.user?.role);

  if (tabs.length === 0 || (role && MOBILE_TAB_HIDDEN_ROLES.includes(role))) return null;

  return (
    <nav
      data-native-chrome
      className="flex shrink-0 items-stretch border-t border-border bg-background px-1 pt-1"
      style={{ paddingBottom: "calc(4px + var(--sab, 0px))" }}
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const active = isActive(tab.url);
        return (
          <MobileTabLink key={tab.url} href={tab.url} active={active}>
            <span className="relative flex h-8 w-14 items-center justify-center">
              {active && (
                <motion.span
                  layoutId="mobile-tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))" }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <tab.icon
                size={21}
                className="relative"
                style={active ? { color: "var(--theme-active-text)" } : undefined}
              />
            </span>
            <MobileTabLabel active={active}>{tab.title}</MobileTabLabel>
          </MobileTabLink>
        );
      })}

      <MobileTabButton active={openMobile} onClick={toggleSidebar} aria-label="Open menu">
        <span className="flex h-8 w-14 items-center justify-center">
          <Menu size={21} />
        </span>
        <span>Menu</span>
      </MobileTabButton>
    </nav>
  );
}
