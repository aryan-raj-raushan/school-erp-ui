'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { AuthContext } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, context } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && context === AuthContext.SCHOOL) {
      router.replace(ROUTES.schoolDashboard);
    } else if (isAuthenticated && context === AuthContext.COMPANY) {
      router.replace(ROUTES.dashboard);
    } else {
      router.replace(ROUTES.login);
    }
  }, [router, isAuthenticated, context]);

  return null;
}
