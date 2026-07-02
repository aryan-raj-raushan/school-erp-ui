import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { applyAuthInterceptors } from './interceptors/auth.interceptor';
import { applyMsgpackInterceptors } from './interceptors/msgpack.interceptor';
import { applyErrorInterceptor } from './interceptors/error.interceptor';
import { TokenStorage } from './token.storage';
import { ENDPOINTS } from './endpoints';
import type {
  ApiGatewayConfig,
  ApiEnvelope,
  GatewayResponse,
  RequestOptions,
  RefreshTokenFn,
} from '@/types';

export class ApiGateway {
  private readonly http: AxiosInstance;

  constructor(config: ApiGatewayConfig, onAuthFailure: () => void = () => {}) {
    this.http = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 10_000,
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers,
      },
    });

    const refreshFn: RefreshTokenFn = async () => {
      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      // Backend JwtRefreshStrategy requires: Bearer <refreshToken> header + body { refreshToken }
      const response = await this.post<{ accessToken: string; refreshToken: string }>(
        ENDPOINTS.auth.refresh,
        { refreshToken },
        {
          skipRefresh: true,
          skipAuth: true,
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
      );
      return response.data;
    };

    applyAuthInterceptors(this.http, refreshFn, onAuthFailure);
    applyMsgpackInterceptors(this.http);
    applyErrorInterceptor(this.http);
  }

  private async request<T>(options: RequestOptions): Promise<GatewayResponse<T>> {
    const response = await this.http.request<ApiEnvelope<T>>(options);
    return response.data;
  }

  async get<T>(url: string, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'GET', url });
  }

  async post<T>(url: string, data?: unknown, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: unknown, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: unknown, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, data?: unknown, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}): Promise<GatewayResponse<T>> {
    return this.request<T>({ ...options, method: 'DELETE', url, data });
  }

  async upload<T>(url: string, formData: FormData, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}): Promise<GatewayResponse<T>> {
    return this.request<T>({
      ...options,
      method: 'POST',
      url,
      data: formData,
      headers: { ...options.headers, 'Content-Type': 'multipart/form-data' },
    });
  }

  get axiosInstance(): AxiosInstance {
    return this.http;
  }
}
