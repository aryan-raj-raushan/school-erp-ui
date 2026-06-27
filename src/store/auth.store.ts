import { create } from 'zustand';
import { AppStorage } from '@/lib/app-storage';
import { STORAGE_KEYS } from '@/constants';
import { type AuthContext, type UserProfile } from '@/types';

const PERM_KEY = 'auth:permissions';

function readSession(): { user: UserProfile | null; context: AuthContext | null; isAuthenticated: boolean; permissions: string[] } {
  try {
    const raw = AppStorage.get(STORAGE_KEYS.user);
    const user: UserProfile | null = raw ? (JSON.parse(raw) as UserProfile) : null;
    const context = (AppStorage.get(STORAGE_KEYS.context) as AuthContext) ?? null;
    const isAuthenticated = AppStorage.get(STORAGE_KEYS.isAuthenticated) === 'true';
    const permRaw = AppStorage.get(PERM_KEY);
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
  permissions: string[];
  setAuth: (user: UserProfile, context: AuthContext) => void;
  setPermissions: (permissions: string[]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readSession(),

  setAuth: (user, context) => {
    AppStorage.set(STORAGE_KEYS.user, JSON.stringify(user));
    AppStorage.set(STORAGE_KEYS.context, context);
    AppStorage.set(STORAGE_KEYS.isAuthenticated, 'true');
    set({ user, context, isAuthenticated: true });
  },

  setPermissions: (permissions) => {
    AppStorage.set(PERM_KEY, JSON.stringify(permissions));
    set({ permissions });
  },

  clearAuth: () => {
    AppStorage.delete(STORAGE_KEYS.user);
    AppStorage.delete(STORAGE_KEYS.context);
    AppStorage.delete(STORAGE_KEYS.isAuthenticated);
    AppStorage.delete(PERM_KEY);
    // Also clear tokens
    AppStorage.delete('auth:access_token');
    AppStorage.delete('auth:refresh_token');
    set({ user: null, context: null, isAuthenticated: false, permissions: [] });
  },
}));
