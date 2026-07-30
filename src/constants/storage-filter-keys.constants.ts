const PREFIX = "school-erp:filters";

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
  STUDY_MATERIALS: `${PREFIX}:study-materials`,
  LEAVE: `${PREFIX}:leave`,
  SYLLABUS: `${PREFIX}:syllabus`,
  SCHOOL_EVENTS: "school_events_filters", 
   AUDIT_LOG: "audit_log_filters",
} as const;

export type StorageFilterKey =
  (typeof STORAGE_FILTER_KEYS)[keyof typeof STORAGE_FILTER_KEYS];
