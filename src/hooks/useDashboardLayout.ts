"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants";
import { useAuth } from "./useAuth";
import { useAuthStore } from "@/store/auth.store";
import { useSidebarStore } from "@/store/sidebar.store";
import { useMemo } from "react";

export function useDashboardLayout() {
  const pathname = usePathname();
  const { logout, isLoading } = useAuth();
  const user = useAuthStore((s) => s.user);
  const { isCollapsed, toggle: toggleSidebar } = useSidebarStore();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  const userInfo = useMemo(() => {
    const { first_name = "", last_name, email = "" } = user ?? {};

    const safeLastName = last_name ?? "";

    return {
      fullName: [first_name, safeLastName].filter(Boolean).join(" "),
      initials:
        `${first_name.charAt(0)}${safeLastName.charAt(0)}`.toUpperCase(),
      email,
    };
  }, [user]);

  return {
    user,
    userInfo,
    pathname,
    navItems: visibleNavItems,
    logout,
    isLoading,
    isCollapsed,
    toggleSidebar,
  };
}
