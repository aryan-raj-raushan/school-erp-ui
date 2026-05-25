import type { AxiosRequestConfig } from 'axios';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface ApiGatewayConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions<D = unknown> extends AxiosRequestConfig<D> {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export type GatewayResponse<T> = ApiEnvelope<T>;

export type RefreshTokenFn = () => Promise<{ accessToken: string; refreshToken: string }>;

export type { AxiosRequestConfig };
