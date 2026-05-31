import type { AxiosInstance, AxiosError } from 'axios';

export class GatewayError extends Error {
  constructor(
    public override readonly message: string,
    public readonly status: number,
    public readonly data: unknown = null,
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
        const { status, data: body } = error.response;
        const message = body?.message ?? body?.error ?? `Request failed with status ${status}`;
        return Promise.reject(new GatewayError(message, status, body));
      }

      if (error.request) {
        return Promise.reject(new GatewayError('Network error — please check your connection.', 0, null, true));
      }

      return Promise.reject(new GatewayError(error.message ?? 'Unexpected error', 0));
    },
  );
}
