'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Role } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
      router.replace(ROUTES.schools);
    }
    // future: add other role redirects here
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-zinc-500">Loading…</p>
    </div>
  );
}
