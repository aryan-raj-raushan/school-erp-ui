/**
 * types/index.ts
 *
 * Shared types for the API Gateway layer.
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// ─── Generic API envelope (matches backend ApiResponse shape) ─────────────────

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Gateway config ───────────────────────────────────────────────────────────

export interface ApiGatewayConfig {
  /** Base URL of the REST API, e.g. "https://api.example.com/v1" */
  baseURL: string;
  /** Default request timeout in ms (default: 10_000) */
  timeout?: number;
  /** Extra default headers merged with every request */
  headers?: Record<string, string>;
}

// ─── Per-request options ──────────────────────────────────────────────────────

export interface RequestOptions<D = unknown> extends AxiosRequestConfig<D> {
  /**
   * When true the gateway skips injecting the Authorization header.
   * Use for public endpoints like /auth/login.
   */
  skipAuth?: boolean;
  /**
   * When true the gateway will NOT attempt a silent token refresh on 401.
   * Prevents infinite loops on the /auth/refresh endpoint itself.
   */
  skipRefresh?: boolean;
}

// ─── Parsed response ──────────────────────────────────────────────────────────

export type GatewayResponse<T> = ApiEnvelope<T>;

// ─── Token refresh callback ───────────────────────────────────────────────────

export type RefreshTokenFn = () => Promise<{ accessToken: string; refreshToken: string }>;

// ─── Re-export axios types used across the gateway ───────────────────────────

export type { AxiosResponse, AxiosRequestConfig };