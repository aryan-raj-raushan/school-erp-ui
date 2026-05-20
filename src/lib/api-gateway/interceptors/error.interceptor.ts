/**
 * interceptors/error.interceptor.ts
 *
 * Transforms raw Axios errors into a structured GatewayError so callers
 * always deal with a single, predictable error shape.
 */

import type { AxiosInstance, AxiosError } from 'axios';

export class GatewayError extends Error {
  constructor(
    /** Human-readable message from the API or a fallback */
    public override readonly message: string,
    /** HTTP status code (0 for network errors) */
    public readonly status: number,
    /** The raw API error payload if available */
    public readonly data: unknown = null,
    /** Whether the request was made but no response received */
    public readonly isNetworkError: boolean = false,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export function applyErrorInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; error?: string }>) => {
      if (error.response) {
        // Server responded with a non-2xx status
        const status = error.response.status;
        const body = error.response.data;
        const message =
          body?.message ??
          body?.error ??
          `Request failed with status ${status}`;

        return Promise.reject(new GatewayError(message, status, body));
      }

      if (error.request) {
        // Request was sent but no response arrived (network error, timeout)
        return Promise.reject(
          new GatewayError(
            'Network error — please check your connection.',
            0,
            null,
            true,
          ),
        );
      }

      // Something happened before the request was sent
      return Promise.reject(
        new GatewayError(error.message ?? 'Unexpected error', 0),
      );
    },
  );
}