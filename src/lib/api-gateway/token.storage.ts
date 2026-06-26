import { AppStorage } from '@/lib/app-storage';
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
    AppStorage.set(STORAGE_KEYS.accessToken, tokens.accessToken);
    AppStorage.set(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    AppStorage.set(STORAGE_KEYS.context, context);
  },

  getAccessToken(): string | null {
    return AppStorage.get(STORAGE_KEYS.accessToken);
  },

  getRefreshToken(): string | null {
    return AppStorage.get(STORAGE_KEYS.refreshToken);
  },

  getContext(): AuthContext | null {
    return (AppStorage.get(STORAGE_KEYS.context) as AuthContext) ?? null;
  },

  getSession(): StoredSession | null {
    const accessToken = TokenStorage.getAccessToken();
    const refreshToken = TokenStorage.getRefreshToken();
    const context = TokenStorage.getContext();
    if (!accessToken || !refreshToken || !context) return null;
    return { accessToken, refreshToken, context };
  },

  updateAccessToken(token: string): void {
    AppStorage.set(STORAGE_KEYS.accessToken, token);
  },

  updateTokens(tokens: TokenPair): void {
    AppStorage.set(STORAGE_KEYS.accessToken, tokens.accessToken);
    AppStorage.set(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },

  clear(): void {
    AppStorage.delete(STORAGE_KEYS.accessToken);
    AppStorage.delete(STORAGE_KEYS.refreshToken);
    AppStorage.delete(STORAGE_KEYS.context);
  },

  isAuthenticated(): boolean {
    return Boolean(TokenStorage.getAccessToken());
  },
};
