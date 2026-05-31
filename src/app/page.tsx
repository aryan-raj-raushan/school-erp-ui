'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { TokenStorage } from '@/lib/api-gateway/token.storage';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(TokenStorage.isAuthenticated() ? ROUTES.dashboard : ROUTES.login);
  }, [router]);

  return null;
}
