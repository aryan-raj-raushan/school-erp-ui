import { Capacitor } from '@capacitor/core';
import type { Clerk } from '@clerk/clerk-js';
import { ROUTES } from '@/constants';
import type { SocialProvider } from '@/components/ui';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

let clerkInstance: Promise<Clerk> | null = null;

export function isSocialLoginEnabled(): boolean {
  return Boolean(publishableKey) && !Capacitor.isNativePlatform();
}

function loadClerk(): Promise<Clerk> {
  if (!publishableKey) return Promise.reject(new Error('Social login is not configured'));
  clerkInstance ??= import('@clerk/clerk-js').then(async ({ Clerk: ClerkClass }) => {
    const clerk = new ClerkClass(publishableKey);
    await clerk.load();
    return clerk;
  });
  return clerkInstance;
}

export async function startSocialLogin(provider: SocialProvider): Promise<void> {
  const clerk = await loadClerk();
  if (clerk.session) await clerk.signOut();
  const callbackUrl = `${window.location.origin}${ROUTES.ssoCallback}`;
  await clerk.client!.signIn.authenticateWithRedirect({
    strategy: `oauth_${provider}`,
    redirectUrl: callbackUrl,
    redirectUrlComplete: callbackUrl,
  });
}

export async function completeSocialLogin(): Promise<string> {
  const clerk = await loadClerk();
  if (!clerk.session) {
    await clerk.handleRedirectCallback({}, async () => undefined);
  }
  const token = await clerk.session?.getToken();
  if (!token) throw new Error('Sign-in was cancelled or could not be completed');
  return token;
}

export async function endSocialSession(): Promise<void> {
  const clerk = await loadClerk();
  if (clerk.session) await clerk.signOut();
}
