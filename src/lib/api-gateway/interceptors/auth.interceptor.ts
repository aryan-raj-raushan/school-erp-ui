import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenStorage } from '../token.storage';
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
  let isRefreshing = false;
  // Each queued item holds resolve/reject AND its original config for retry
  const failedQueue: Array<{
    config: InternalAxiosRequestConfig;
    resolve: (res: AxiosResponse) => void;
    reject: (err: unknown) => void;
  }> = [];

  function flushQueue(error: unknown, accessToken: string | null): void {
    const queue = failedQueue.splice(0);
    if (error) {
      queue.forEach(({ reject }) => reject(error));
    } else {
      queue.forEach(({ config, resolve, reject }) => {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        axiosInstance(config).then(resolve).catch(reject);
      });
    }
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

      // Already refreshing — queue this request
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({ config: originalRequest, resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await onRefreshToken();
        TokenStorage.updateTokens(tokens);
        originalRequest.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        flushQueue(null, tokens.accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        onAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
