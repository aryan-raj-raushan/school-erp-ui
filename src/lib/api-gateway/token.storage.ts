import { AuthContext } from '@/types';
import { STORAGE_KEYS } from '@/constants';

export { AuthContext };

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  context: AuthContext;
}

export const TokenStorage = {
  save(tokens: TokenPair, context: AuthContext): void {
    try {
      localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
      localStorage.setItem(STORAGE_KEYS.context, context);
    } catch {
      // localStorage unavailable in SSR / private mode
    }
  },

  getAccessToken(): string | null {
    try { return localStorage.getItem(STORAGE_KEYS.accessToken); } catch { return null; }
  },

  getRefreshToken(): string | null {
    try { return localStorage.getItem(STORAGE_KEYS.refreshToken); } catch { return null; }
  },

  getContext(): AuthContext | null {
    try {
      return (localStorage.getItem(STORAGE_KEYS.context) as AuthContext) ?? null;
    } catch { return null; }
  },

  getSession(): StoredSession | null {
    const accessToken = TokenStorage.getAccessToken();
    const refreshToken = TokenStorage.getRefreshToken();
    const context = TokenStorage.getContext();
    if (!accessToken || !refreshToken || !context) return null;
    return { accessToken, refreshToken, context };
  },

  updateAccessToken(token: string): void {
    try { localStorage.setItem(STORAGE_KEYS.accessToken, token); } catch { /* noop */ }
  },

  updateTokens(tokens: TokenPair): void {
    try {
      localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    } catch { /* noop */ }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.context);
    } catch { /* noop */ }
  },

  isAuthenticated(): boolean {
    return Boolean(TokenStorage.getAccessToken());
  },
};
