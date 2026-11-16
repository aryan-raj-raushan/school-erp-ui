import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenStorage } from '../token.storage';
import { GatewayError } from './error.interceptor';
import type { RefreshTokenFn } from '@/types';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    skipRefresh?: boolean;
    _retry?: boolean;
  }
}

export function applyAuthInterceptors(
  axiosInstance: AxiosInstance,
  onRefreshToken: RefreshTokenFn,
  onAuthFailure: () => void,
): void {
  // ── Request: attach access token ─────────────────────────────────────────
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.skipAuth) return config;
      const token = TokenStorage.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // ── Response: 401 → refresh → retry ──────────────────────────────────────
  let inFlight: Promise<string> | null = null;

  async function refreshOnce(staleAccessToken: string | null): Promise<string> {
    return withRefreshLock(async () => {
      const current = TokenStorage.getAccessToken();
      if (current && current !== staleAccessToken) return current;
      const tokens = await onRefreshToken();
      TokenStorage.updateTokens(tokens);
      return tokens.accessToken;
    });
  }

  function freshAccessToken(staleAccessToken: string | null): Promise<string> {
    inFlight ??= refreshOnce(staleAccessToken).finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  axiosInstance.interceptors.response.use(
    (res: AxiosResponse) => res,

    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;
      if (!originalRequest) return Promise.reject(error);

      const is401 = error.response?.status === 401;
      if (!is401 || originalRequest._retry || originalRequest.skipRefresh) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const accessToken = await freshAccessToken(bearerToken(originalRequest));
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (isSessionRejected(refreshError) || !TokenStorage.getRefreshToken()) onAuthFailure();
        return Promise.reject(refreshError);
      }
    },
  );
}

const REFRESH_LOCK_NAME = 'auth-token-refresh';

// Refresh tokens are single-use, so tabs must take turns; the second tab then reuses the first tab's result.
function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(REFRESH_LOCK_NAME, task) as Promise<T>;
  }
  return task();
}

function bearerToken(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers?.['Authorization'];
  return typeof header === 'string' ? header.replace(/^Bearer /, '') : null;
}

// Only an explicit rejection ends the session; rate limits, timeouts and network drops must not log the user out.
function isSessionRejected(error: unknown): boolean {
  return error instanceof GatewayError && (error.status === 401 || error.status === 403);
}
