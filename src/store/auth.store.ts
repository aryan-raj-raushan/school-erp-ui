import { create } from 'zustand';
import { CookieUtils } from '@/lib/cookie.utils';
import { STORAGE_KEYS } from '@/constants';
import { type AuthContext, type UserProfile } from '@/types';

function readSession(): { user: UserProfile | null; context: AuthContext | null; isAuthenticated: boolean; permissions: string[] } {
  try {
    const raw = CookieUtils.get(STORAGE_KEYS.user);
    const user: UserProfile | null = raw ? (JSON.parse(raw) as UserProfile) : null;
    const context = (CookieUtils.get(STORAGE_KEYS.context) as AuthContext) ?? null;
    const isAuthenticated = CookieUtils.get(STORAGE_KEYS.isAuthenticated) === 'true';
    const permRaw = CookieUtils.get('auth:permissions');
    const permissions: string[] = permRaw ? (JSON.parse(permRaw) as string[]) : [];
    return { user, context, isAuthenticated, permissions };
  } catch {
    return { user: null, context: null, isAuthenticated: false, permissions: [] };
  }
}

interface AuthState {
  user: UserProfile | null;
  context: AuthContext | null;
  isAuthenticated: boolean;
  /** Permission slugs resolved from DB — e.g. ['students.view', 'fees.create'] */
  permissions: string[];
  setAuth: (user: UserProfile, context: AuthContext) => void;
  setPermissions: (permissions: string[]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readSession(),

  setAuth: (user, context) => {
    CookieUtils.set(STORAGE_KEYS.user, JSON.stringify(user));
    CookieUtils.set(STORAGE_KEYS.context, context);
    CookieUtils.set(STORAGE_KEYS.isAuthenticated, 'true');
    set({ user, context, isAuthenticated: true });
  },

  setPermissions: (permissions) => {
    CookieUtils.set('auth:permissions', JSON.stringify(permissions));
    set({ permissions });
  },

  clearAuth: () => {
    CookieUtils.delete(STORAGE_KEYS.user);
    CookieUtils.delete(STORAGE_KEYS.context);
    CookieUtils.delete(STORAGE_KEYS.isAuthenticated);
    CookieUtils.delete('auth:permissions');
    set({ user: null, context: null, isAuthenticated: false, permissions: [] });
  },
}));
