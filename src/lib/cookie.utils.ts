const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export const CookieUtils = {
  set(name: string, value: string, maxAge = COOKIE_MAX_AGE): void {
    if (typeof document === 'undefined') return;
    const key = encodeURIComponent(name);
    document.cookie = `${key}=${encodeURIComponent(value)};max-age=${maxAge};path=/;SameSite=Lax`;
  },

  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const key = encodeURIComponent(name);
    const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  },

  delete(name: string): void {
    if (typeof document === 'undefined') return;
    const key = encodeURIComponent(name);
    document.cookie = `${key}=;max-age=0;path=/`;
  },
};
