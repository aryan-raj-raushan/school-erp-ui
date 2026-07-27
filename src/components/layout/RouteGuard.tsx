'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';
import { getRequiredPermissionsForPath, selectNavMain } from '@/lib/route-permissions';

/**
 * Route-level permission enforcement. Until now, a lacking permission only
 * hid the sidebar link — a user who knew/bookmarked a URL (e.g. /fees/setup)
 * could still load the full page shell, with individual API calls 403-ing
 * server-side. This closes that gap using the exact same nav config the
 * sidebar already uses to decide what's visible.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const context = useAuthStore((s) => s.context);
  const permissions = useAuthStore((s) => s.permissions);

  useEffect(() => {
    if (!isAuthenticated || pathname === ROUTES.unauthorized) return;

    const navMain = selectNavMain(user, context);
    const required = getRequiredPermissionsForPath(pathname, navMain);
    if (required && required.length > 0 && !required.some((p) => permissions.includes(p))) {
      router.replace(ROUTES.unauthorized);
    }
  }, [pathname, user, context, permissions, isAuthenticated, router]);

  return <>{children}</>;
}
