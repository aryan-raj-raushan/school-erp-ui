/**
 * token.storage.ts
 *
 * Centralised, type-safe wrapper around sessionStorage / localStorage for JWT
 * tokens. Mirrors the backend's AuthContext enum so keys stay consistent.
 */

export enum AuthContext {
  COMPANY = 'COMPANY',
  SCHOOL = 'SCHOOL',
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  context: AuthContext;
}

// ─── key helpers ─────────────────────────────────────────────────────────────

const ACCESS_KEY = 'auth:access_token';
const REFRESH_KEY = 'auth:refresh_token';
const CONTEXT_KEY = 'auth:context';

// ─── public API ──────────────────────────────────────────────────────────────

export const TokenStorage = {
  /** Persist tokens after a successful login / refresh. */
  save(tokens: TokenPair, context: AuthContext): void {
    try {
      localStorage.setItem(ACCESS_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
      localStorage.setItem(CONTEXT_KEY, context);
    } catch {
      // localStorage may be unavailable (SSR, private mode)
    }
  },

  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },

  getContext(): AuthContext | null {
    try {
      return (localStorage.getItem(CONTEXT_KEY) as AuthContext) ?? null;
    } catch {
      return null;
    }
  },

  getSession(): StoredSession | null {
    const accessToken = TokenStorage.getAccessToken();
    const refreshToken = TokenStorage.getRefreshToken();
    const context = TokenStorage.getContext();
    if (!accessToken || !refreshToken || !context) return null;
    return { accessToken, refreshToken, context };
  },

  /** Update only the access token (e.g. after a silent refresh). */
  updateAccessToken(token: string): void {
    try {
      localStorage.setItem(ACCESS_KEY, token);
    } catch {
      // noop
    }
  },

  /** Update both tokens (e.g. after a full refresh cycle). */
  updateTokens(tokens: TokenPair): void {
    try {
      localStorage.setItem(ACCESS_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    } catch {
      // noop
    }
  },

  /** Remove all auth data on logout. */
  clear(): void {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(CONTEXT_KEY);
    } catch {
      // noop
    }
  },

  isAuthenticated(): boolean {
    return Boolean(TokenStorage.getAccessToken());
  },
};