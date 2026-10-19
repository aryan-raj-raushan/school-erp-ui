'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  SCHOOL_NAV_SECONDARY,
  SUPER_ADMIN_NAV_SECONDARY,
  SALES_NAV_SECONDARY,
  OPERATOR_NAV_SECONDARY,
} from '@/constants/layout/app-sidebar.constants';
import { MOBILE_TAB_CANDIDATES, MOBILE_TAB_LIMIT } from '@/constants/mobile-nav.constants';
import { selectNavMain } from '@/lib/route-permissions';
import { useAuthStore } from '@/store/auth.store';
import { AuthContext, Role } from '@/types';
import type { NavItemConfig } from '@/types/layout/app-sidebar';

export interface MobileTab {
  title: string;
  url: string;
  icon: NavItemConfig['icon'];
}

function isActivePath(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function useNavItems() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const context = useAuthStore((s) => s.context);
  const permissions = useAuthStore((s) => s.permissions);

  return useMemo(() => {
    const isCompany = context === AuthContext.COMPANY;

    let secondarySource: NavItemConfig[] = SCHOOL_NAV_SECONDARY;
    if (isCompany) {
      if (user?.role === Role.SALES) secondarySource = SALES_NAV_SECONDARY;
      else if (user?.role === Role.OPERATOR) secondarySource = OPERATOR_NAV_SECONDARY;
      else secondarySource = SUPER_ADMIN_NAV_SECONDARY;
    }

    const navMain = selectNavMain(user, context)
      .map((item) => {
        if (!item.items?.length) return item;
        const items = item.items.filter(
          (sub) => !sub.permissions || sub.permissions.some((p) => permissions.includes(p)),
        );
        return { ...item, items };
      })
      .filter((item) => {
        const roleOk = !item.roles || (user?.role && item.roles.includes(user.role));
        const permOk = !item.permissions || item.permissions.some((p) => permissions.includes(p));
        const hasChildren = !item.items || item.items.length > 0;
        return roleOk && permOk && hasChildren;
      });

    const navSecondary = secondarySource.filter(
      (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
    );

    let tabs: MobileTab[];
    if (isCompany) {
      tabs = navMain
        .filter((i) => i.url && i.url !== '#')
        .slice(0, MOBILE_TAB_LIMIT)
        .map((i) => ({ title: i.title.includes('Dashboard') ? 'Home' : i.title, url: i.url, icon: i.icon }));
    } else {
      tabs = MOBILE_TAB_CANDIDATES.filter(
        (t) => !t.permissions || t.permissions.some((p) => permissions.includes(p)),
      )
        .slice(0, MOBILE_TAB_LIMIT)
        .map(({ title, url, icon }) => ({ title, url, icon }));
    }

    const leaves: { title: string; url: string }[] = [];
    for (const item of [...navMain, ...navSecondary]) {
      if (item.items?.length) item.items.forEach((s) => leaves.push({ title: s.title, url: s.url }));
      else if (item.url && item.url !== '#') leaves.push({ title: item.title, url: item.url });
    }
    let current: { title: string; url: string } | undefined;
    for (const l of leaves) {
      if (isActivePath(pathname, l.url) && (!current || l.url.length > current.url.length)) current = l;
    }

    const isTabRoot = tabs.some((t) => pathname === t.url);

    return {
      navMain,
      navSecondary,
      tabs,
      pageTitle: current?.title ?? null,
      isTabRoot,
      isActive: (url: string) => isActivePath(pathname, url),
    };
  }, [pathname, user, context, permissions]);
}
