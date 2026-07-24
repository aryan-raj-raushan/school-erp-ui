const PREFIX = "school-erp:forms";


export const FORM_STORAGE_KEYS = {
  STUDENT_CREATE: `${PREFIX}:student-create`,
  STAFF_CREATE: `${PREFIX}:staff-create`,
  ADMISSION_ENQUIRY_CREATE: `${PREFIX}:admission-enquiry-create`,
} as const;

export type FormStorageKey =
  (typeof FORM_STORAGE_KEYS)[keyof typeof FORM_STORAGE_KEYS];
