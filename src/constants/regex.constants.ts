export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{7,15}$/,
  dialCode: /^\+\d{1,4}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  url: /^https?:\/\/.+\..+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /** Partial numeric entry: allows digits, optional single dot, more digits (e.g. "9", "9.", "9.5") */
  numericPartial: /^\d*\.?\d*$/,
  /** Backend-enforced Indian mobile format (create-student/create-staff/create-parent DTOs) */
  phoneIn: /^[6-9]\d{9}$/,
  /** Backend-enforced dial code format, e.g. +91, +1, +886 */
  dialCodeStrict: /^\+[1-9]\d{0,3}$/,
  /** Backend-enforced 12-digit Aadhaar number */
  aadhaar: /^\d{12}$/,
  /** Digits only, no length constraint (e.g. to detect phone-style input while typing) */
  digitsOnly: /^\d+$/,
} as const;
