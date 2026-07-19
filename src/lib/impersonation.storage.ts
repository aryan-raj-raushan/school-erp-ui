import { AppStorage } from '@/lib/app-storage';
import type { AuthContext, UserProfile } from '@/types';

const KEY = 'impersonation:origin';

export interface ImpersonationOrigin {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  context: AuthContext;
  permissions: string[];
}

/**
 * Holds the Super Admin's own session while they're impersonating a School Admin
 * (via "Login" on the Schools page), so logging out of the impersonated session
 * can restore the Super Admin instead of doing a real logout.
 */
export const ImpersonationStorage = {
  stash(origin: ImpersonationOrigin): void {
    AppStorage.set(KEY, JSON.stringify(origin));
  },

  read(): ImpersonationOrigin | null {
    const raw = AppStorage.get(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ImpersonationOrigin;
    } catch {
      return null;
    }
  },

  clear(): void {
    AppStorage.delete(KEY);
  },
};
