/**
 * interceptors/auth.interceptor.ts
 *
 * Axios interceptors that:
 *   1. Inject the Authorization header on every outbound request (unless skipAuth).
 *   2. Transparently refresh the access token on a 401 and retry the original request once.
 *   3. Queue concurrent 401 requests so only one refresh call is made.
 */

import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenStorage } from '../token.storage';
import type { RefreshTokenFn } from '../types';

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}

// Extend InternalAxiosRequestConfig to carry our custom flags
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
  // ── REQUEST interceptor ──────────────────────────────────────────────────
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

  // ── RESPONSE interceptor ─────────────────────────────────────────────────
  let isRefreshing = false;
  let failedQueue: QueuedRequest[] = [];

  function processQueue(error: unknown, token: string | null = null): void {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    failedQueue = [];
  }

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;

      const is401 = error.response?.status === 401;
      const alreadyRetried = originalRequest._retry;
      const shouldSkipRefresh = originalRequest.skipRefresh;

      if (!is401 || alreadyRetried || shouldSkipRefresh) {
        return Promise.reject(error);
      }

      // ── Queue concurrent requests while a refresh is in-flight ──────────
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await onRefreshToken();
        TokenStorage.updateTokens(tokens);

        originalRequest.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        processQueue(null, tokens.accessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenStorage.clear();
        onAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}