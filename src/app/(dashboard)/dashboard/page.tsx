'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Role } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { Div, Spinner } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
      router.replace(ROUTES.schools);
    } else if (user.role === Role.SCHOOL_ADMIN) {
      router.replace(ROUTES.schoolDashboard);
    }
  }, [user, router]);

  return (
    <Div type="row" justify="center" align="center" full className="h-full">
      <Spinner size="lg" />
    </Div>
  );
}
