import type { PhoneVerificationRequired } from '@/services/auth.service';

const KEY = 'auth:phone-verification';

export const PhoneVerificationStorage = {
  save(pending: PhoneVerificationRequired) {
    window.sessionStorage.setItem(KEY, JSON.stringify(pending));
  },
  read(): PhoneVerificationRequired | null {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PhoneVerificationRequired) : null;
    } catch {
      return null;
    }
  },
  clear() {
    window.sessionStorage.removeItem(KEY);
  },
};
