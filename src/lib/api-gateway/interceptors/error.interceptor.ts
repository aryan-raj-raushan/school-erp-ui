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

function extractMessage(body: { message?: string; error?: string; errors?: Record<string, string> } | null | undefined, status: number): string {
  if (body?.errors && typeof body.errors === 'object') {
    const details = Object.entries(body.errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(', ');
    return details;
  }
  return body?.message ?? body?.error ?? `Request failed with status ${status}`;
}

export function applyErrorInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; error?: string; errors?: Record<string, string> }>) => {
      if (error.response) {
        const { status, data: body } = error.response;
        const message = extractMessage(body, status);
        return Promise.reject(new GatewayError(message, status, body));
      }

      if (error.request) {
        return Promise.reject(new GatewayError('Network error — please check your connection.', 0, null, true));
      }

      return Promise.reject(new GatewayError(error.message ?? 'Unexpected error', 0));
    },
  );
}
