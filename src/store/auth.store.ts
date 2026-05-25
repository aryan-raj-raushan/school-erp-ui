import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import { type AuthContext, type UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  context: AuthContext | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, context: AuthContext) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  context: null,
  isAuthenticated:
    typeof window !== 'undefined'
      ? sessionStorage.getItem(STORAGE_KEYS.isAuthenticated) === 'true'
      : false,

  setAuth: (user, context) => {
    try { sessionStorage.setItem(STORAGE_KEYS.isAuthenticated, 'true'); } catch { /* noop */ }
    set({ user, context, isAuthenticated: true });
  },

  clearAuth: () => {
    try { sessionStorage.removeItem(STORAGE_KEYS.isAuthenticated); } catch { /* noop */ }
    set({ user: null, context: null, isAuthenticated: false });
  },
}));
