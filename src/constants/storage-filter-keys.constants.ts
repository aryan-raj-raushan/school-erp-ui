const PREFIX = "school-erp:filters";

export const STORAGE_FILTER_KEYS = {
  STUDENTS: `${PREFIX}:students`,
  STAFF: `${PREFIX}:staff`,
  PARENTS: `${PREFIX}:parents`,
  ADMISSIONS: `${PREFIX}:admissions`,
  ATTENDANCE: `${PREFIX}:attendance`,
  FEE_PAYMENTS: `${PREFIX}:fee-payments`,
  EXAMS: `${PREFIX}:exams`,
  HOMEWORK: `${PREFIX}:homework`,
  LEAVE: `${PREFIX}:leave`,
  SYLLABUS: `${PREFIX}:syllabus`,
} as const;

export type StorageFilterKey =
  (typeof STORAGE_FILTER_KEYS)[keyof typeof STORAGE_FILTER_KEYS];
