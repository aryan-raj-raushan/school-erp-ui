export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{7,15}$/,
  dialCode: /^\+\d{1,4}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  url: /^https?:\/\/.+\..+/,
} as const;
