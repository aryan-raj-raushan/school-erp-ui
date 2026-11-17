import type { AxiosInstance, AxiosError } from 'axios';
import { decode } from '@msgpack/msgpack';

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

type ErrorBody = { message?: string | string[]; error?: string; errors?: Record<string, string> | string[] };

function humanizeField(path: string): string {
  const leaf = path.split('.').filter((part) => !/^\d+$/.test(part)).pop() ?? path;
  const words = leaf.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function describeFieldError(field: string, msg: string): string {
  const leaf = field.split('.').pop() ?? field;
  if (/^\d+$/.test(field) || msg.toLowerCase().startsWith(leaf.toLowerCase())) {
    return msg.charAt(0).toUpperCase() + msg.slice(1);
  }
  return `${humanizeField(field)}: ${msg}`;
}

function extractMessage(body: ErrorBody | null | undefined, status: number): string {
  if (Array.isArray(body?.errors) && body.errors.length) return body.errors.join(', ');
  if (body?.errors && typeof body.errors === 'object' && Object.keys(body.errors).length) {
    return Object.entries(body.errors)
      .map(([field, msg]) => describeFieldError(field, msg))
      .join(', ');
  }
  if (Array.isArray(body?.message)) return body.message.join(', ');
  return body?.message ?? body?.error ?? `Request failed with status ${status}`;
}

// Uploads (FormData) and file downloads get JSON error bodies, everything else gets msgpack.
function decodeErrorBody(buffer: ArrayBuffer): unknown {
  try {
    return decode(new Uint8Array(buffer));
  } catch {
    try {
      return JSON.parse(new TextDecoder().decode(buffer));
    } catch {
      return null;
    }
  }
}

export function applyErrorInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorBody>) => {
      if (error.response) {
        const { status } = error.response;
        let body = error.response.data;
        if (body instanceof ArrayBuffer) {
          body = decodeErrorBody(body) as typeof body;
        }
        const message = extractMessage(body as Parameters<typeof extractMessage>[0], status);
        return Promise.reject(new GatewayError(message, status, body));
      }

      if (error.request) {
        return Promise.reject(new GatewayError('Network error — please check your connection.', 0, null, true));
      }

      return Promise.reject(new GatewayError(error.message ?? 'Unexpected error', 0));
    },
  );
}
