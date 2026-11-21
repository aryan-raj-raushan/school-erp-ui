'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { SocialProvider } from '@/components/ui';
import { isSocialLoginEnabled, startSocialLogin } from '@/lib/social-auth';

export function useSocialLogin() {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);

  async function signInWith(provider: SocialProvider) {
    setPendingProvider(provider);
    try {
      await startSocialLogin(provider);
    } catch (err: unknown) {
      setPendingProvider(null);
      toast.error(err instanceof Error ? err.message : 'Could not start sign-in');
    }
  }

  return { enabled: isSocialLoginEnabled(), pendingProvider, signInWith };
}
