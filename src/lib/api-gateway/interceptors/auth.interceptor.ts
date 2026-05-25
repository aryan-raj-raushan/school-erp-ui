import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenStorage } from '../token.storage';
import type { RefreshTokenFn } from '@/types/api-gateway.types';

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}

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

  let isRefreshing = false;
  let failedQueue: QueuedRequest[] = [];

  function processQueue(error: unknown, token: string | null = null): void {
    failedQueue.forEach(({ resolve, reject }) => {
      error ? reject(error) : resolve(token!);
    });
    failedQueue = [];
  }

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;
      const is401 = error.response?.status === 401;

      if (!is401 || originalRequest._retry || originalRequest.skipRefresh) {
        return Promise.reject(error);
      }

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
