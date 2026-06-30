import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { encode, decode } from '@msgpack/msgpack';

export function applyMsgpackInterceptors(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Skip FormData (file uploads)
    if (config.data instanceof FormData) return config;

    config.headers['Accept'] = 'application/msgpack';

    if (config.data !== undefined && config.data !== null) {
      const encoded = encode(config.data);
      config.data = new Uint8Array(encoded);
      config.headers['Content-Type'] = 'application/msgpack';
    }

    return config;
  });

  axiosInstance.interceptors.response.use((response: AxiosResponse) => {
    const contentType = String(response.headers['content-type'] ?? '');
    if (response.data instanceof ArrayBuffer) {
      if (contentType.includes('application/msgpack')) {
        try {
          response.data = decode(new Uint8Array(response.data));
        } catch {
          // Fallback: server may have sent JSON (e.g., no Accept header reached backend)
          response.data = JSON.parse(new TextDecoder().decode(response.data));
        }
      } else {
        // Non-msgpack arraybuffer (e.g., JSON response) — decode as text then parse
        try {
          response.data = JSON.parse(new TextDecoder().decode(response.data));
        } catch {
          // Leave as ArrayBuffer if not parseable (e.g., binary file download)
        }
      }
    }
    return response;
  });
}
