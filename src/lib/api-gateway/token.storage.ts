import { CookieUtils } from '@/lib/cookie.utils';
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
    CookieUtils.set(STORAGE_KEYS.accessToken, tokens.accessToken);
    CookieUtils.set(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    CookieUtils.set(STORAGE_KEYS.context, context);
  },

  getAccessToken(): string | null {
    return CookieUtils.get(STORAGE_KEYS.accessToken);
  },

  getRefreshToken(): string | null {
    return CookieUtils.get(STORAGE_KEYS.refreshToken);
  },

  getContext(): AuthContext | null {
    return (CookieUtils.get(STORAGE_KEYS.context) as AuthContext) ?? null;
  },

  getSession(): StoredSession | null {
    const accessToken = TokenStorage.getAccessToken();
    const refreshToken = TokenStorage.getRefreshToken();
    const context = TokenStorage.getContext();
    if (!accessToken || !refreshToken || !context) return null;
    return { accessToken, refreshToken, context };
  },

  updateAccessToken(token: string): void {
    CookieUtils.set(STORAGE_KEYS.accessToken, token);
  },

  updateTokens(tokens: TokenPair): void {
    CookieUtils.set(STORAGE_KEYS.accessToken, tokens.accessToken);
    CookieUtils.set(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },

  clear(): void {
    CookieUtils.delete(STORAGE_KEYS.accessToken);
    CookieUtils.delete(STORAGE_KEYS.refreshToken);
    CookieUtils.delete(STORAGE_KEYS.context);
  },

  isAuthenticated(): boolean {
    return Boolean(TokenStorage.getAccessToken());
  },
  
};
