const PREFIX = "school-erp:filters";
const FORM_PREFIX = "school-erp:forms";

export const STORAGE_FILTER_KEYS = {
  STUDENTS: `${PREFIX}:students`,
  STAFF: `${PREFIX}:staff`,
  PARENTS: `${PREFIX}:parents`,
  ADMISSIONS: `${PREFIX}:admissions`,
  ATTENDANCE: `${PREFIX}:attendance`,
  GATE_PASS: `${PREFIX}:gate-pass`,
  FEE_PAYMENTS: `${PREFIX}:fee-payments`,
  EXAMS: `${PREFIX}:exams`,
  HOMEWORK: `${PREFIX}:homework`,
  LEAVE: `${PREFIX}:leave`,
  SYLLABUS: `${PREFIX}:syllabus`,
  SCHOOL_EVENTS: "school_events_filters", 
   AUDIT_LOG: "audit_log_filters",
} as const;

export const FORM_STORAGE_KEYS = {
  STUDENT_CREATE: `${FORM_PREFIX}:student:create`,
  STUDENT_EDIT: (id: string) => `${FORM_PREFIX}:student:edit:${id}`,
} as const;

export type StorageFilterKey =
  (typeof STORAGE_FILTER_KEYS)[keyof typeof STORAGE_FILTER_KEYS];

export type FormStorageKey = string;
