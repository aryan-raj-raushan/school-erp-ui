import { AuthContext, Role, type UserProfile } from '@/types';
import {
  SCHOOL_NAV_MAIN,
  SUPER_ADMIN_NAV_MAIN,
  SALES_NAV_MAIN,
  OPERATOR_NAV_MAIN,
} from '@/constants/layout/app-sidebar.constants';
import type { NavItemConfig } from '@/types/layout/app-sidebar';

/**
 * Same nav-source selection AppSidebar uses to decide what to render —
 * extracted here so the route guard checks permissions against the exact
 * same nav tree the sidebar uses to decide what's visible, rather than a
 * second copy that could drift out of sync.
 */
export function selectNavMain(
  user: UserProfile | null,
  context: AuthContext | null,
): NavItemConfig[] {
  if (context !== AuthContext.COMPANY) return SCHOOL_NAV_MAIN;
  if (user?.role === Role.SALES) return SALES_NAV_MAIN;
  if (user?.role === Role.OPERATOR) return OPERATOR_NAV_MAIN;
  return SUPER_ADMIN_NAV_MAIN;
}

/**
 * Looks up which permissions (if any) a given pathname requires, based on
 * the same nav config that drives sidebar visibility. Returns undefined for
 * paths not represented in the nav tree at all (no enforcement — safer
 * default than accidentally locking out a valid route we don't know about).
 */
export function getRequiredPermissionsForPath(
  pathname: string,
  navMain: NavItemConfig[],
): string[] | undefined {
  const leaves: { url: string; permissions?: string[] }[] = [];
  for (const item of navMain) {
    if (item.items?.length) {
      for (const sub of item.items) {
        leaves.push({ url: sub.url, permissions: sub.permissions ?? item.permissions });
      }
    } else if (item.url !== '#') {
      leaves.push({ url: item.url, permissions: item.permissions });
    }
  }

  // Longest-prefix match, so '/fees/setup/anything' still matches '/fees/setup'.
  let best: { url: string; permissions?: string[] } | undefined;
  for (const leaf of leaves) {
    if (leaf.url === '#') continue;
    if (pathname === leaf.url || pathname.startsWith(`${leaf.url}/`)) {
      if (!best || leaf.url.length > best.url.length) best = leaf;
    }
  }

  return best?.permissions;
}
