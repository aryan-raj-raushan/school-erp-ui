/**
 * api-gateway.ts
 *
 * A thin, opinionated Axios wrapper that provides:
 *  - Typed GET / POST / PUT / PATCH / DELETE helpers
 *  - Automatic JWT injection via interceptors
 *  - Transparent access-token refresh on 401
 *  - Normalised error shape (GatewayError)
 *  - Zero runtime dependencies beyond axios
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';

import { applyAuthInterceptors } from './interceptors/auth.interceptor';
import { applyErrorInterceptor } from './interceptors/error.interceptor';
import { TokenStorage } from './token.storage';
import type {
  ApiGatewayConfig,
  ApiEnvelope,
  GatewayResponse,
  RequestOptions,
  RefreshTokenFn,
} from '@/types/api-gateway.types';

export class ApiGateway {
  private readonly http: AxiosInstance;

  constructor(config: ApiGatewayConfig, onAuthFailure: () => void = () => {}) {
    this.http = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 10_000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers,
      },
    });

    // Wire up interceptors in the correct order:
    //   error interceptor runs LAST in the response chain (registered first)
    applyErrorInterceptor(this.http);

    //   auth interceptor runs BEFORE the error interceptor for responses
    //   (registered second, so it wraps the error interceptor on the reject path)
    const refreshFn: RefreshTokenFn = async () => {
      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      // Call the backend refresh endpoint directly to avoid circular
      // interceptor invocation (skipRefresh flag is set via RequestOptions).
      const response = await this.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        {},
        {
          skipRefresh: true,
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
      );

      return response.data;
    };

    applyAuthInterceptors(this.http, refreshFn, onAuthFailure);
  }

  // ─── Core request method ────────────────────────────────────────────────────

  private async request<T>(options: RequestOptions): Promise<GatewayResponse<T>> {
    const response = await this.http.request<ApiEnvelope<T>>(options);
    return response.data;
  }

  // ─── HTTP verbs ─────────────────────────────────────────────────────────────

  /**
   * GET  /resource
   * GET  /resource?key=value   — pass params via options.params
   */
  async get<T>(
    url: string,
    options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {},
  ): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'GET', url });
  }

  /**
   * POST /resource
   */
  async post<T>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {},
  ): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'POST', url, data });
  }

  /**
   * PUT /resource/:id  — full replacement
   */
  async put<T>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {},
  ): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'PUT', url, data });
  }

  /**
   * PATCH /resource/:id  — partial update
   */
  async patch<T>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {},
  ): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'PATCH', url, data });
  }

  /**
   * DELETE /resource/:id
   */
  async delete<T>(
    url: string,
    options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {},
  ): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'DELETE', url });
  }

  /**
   * POST with multipart/form-data (file uploads, mixed payloads).
   * Axios automatically sets the correct Content-Type boundary.
   */
  async upload<T>(
    url: string,
    formData: FormData,
    options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {},
  ): Promise<GatewayResponse<T>> {
    return this.request<T>({
      ...options,
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...options.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ─── Utility ────────────────────────────────────────────────────────────────

  /** Expose the underlying Axios instance for advanced / one-off usage. */
  get axiosInstance(): AxiosInstance {
    return this.http;
  }
}