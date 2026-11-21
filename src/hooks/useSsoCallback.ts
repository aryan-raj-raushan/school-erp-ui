'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/constants';
import { completeSocialLogin, endSocialSession } from '@/lib/social-auth';
import { useAuth } from './useAuth';

export function useSsoCallback() {
  const router = useRouter();
  const { loginSocial } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const token = await completeSocialLogin();
        await loginSocial(token);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Sign-in failed');
        router.replace(ROUTES.login);
      } finally {
        await endSocialSession().catch(() => undefined);
      }
    })();
  }, [loginSocial, router]);
}
