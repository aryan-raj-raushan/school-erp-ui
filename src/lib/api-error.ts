import { GatewayError } from './api-gateway/interceptors/error.interceptor';

const GENERIC_SERVER_MESSAGES = [/^Request failed with status \d+$/, /^Internal server error$/i];

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof GatewayError) {
    if (err.isNetworkError) return `${fallback}: ${err.message}`;
    const reason = err.message?.trim();
    if (!reason || GENERIC_SERVER_MESSAGES.some((re) => re.test(reason))) {
      return err.status >= 500 ? `${fallback}: the server hit an unexpected error, please try again` : fallback;
    }
    return reason;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}
