'use client';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/constants';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/store/auth.store';
import { useSidebarStore } from '@/store/sidebar.store';

export function useDashboardLayout() {
  const pathname = usePathname();
  const { logout, isLoading } = useAuth();
  const user = useAuthStore((s) => s.user);
  const { isCollapsed, toggle: toggleSidebar } = useSidebarStore();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  return {
    user,
    pathname,
    navItems: visibleNavItems,
    logout,
    isLoading,
    isCollapsed,
    toggleSidebar,
  };
}
