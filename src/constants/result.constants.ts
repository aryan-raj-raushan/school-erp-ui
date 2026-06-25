// ─── Result / Marks Page ──────────────────────────────────────────────────────

export const RESULT_MARKS_PAGE = {
  pageHeading: {
    title: 'Exam Marks',
    subtitle: 'Enter and manage student marks per exam',
  },
  buttons: {
    addMarks: 'Enter Marks',
    saveMarks: 'Save Marks',
    publishResult: 'Publish Results',
    unpublishResult: 'Unpublish Results',
    back: 'Back',
    cancel: 'Cancel',
    edit: 'Edit',
  },
  filters: {
    selectYear: 'Select Year',
    selectClass: 'Select Class',
    selectSection: 'Select Section',
    selectExam: 'Select Exam',
    searchPlaceholder: 'Search student…',
  },
  table: {
    sno: 'S.No.',
    rollNo: 'Roll No.',
    studentName: 'Student Name',
    absent: 'Absent',
    actions: 'Actions',
    noEntry: 'No students found. Select a class and exam to enter marks.',
    noExam: 'Select an exam to view schedules.',
  },
  toasts: {
    saveSuccess: 'Marks saved successfully',
    saveError: 'Failed to save marks',
    publishSuccess: 'Results published successfully',
    unpublishSuccess: 'Results unpublished successfully',
    publishError: 'Failed to update publish status',
    fetchError: 'Failed to load data',
    loadScheduleError: 'Failed to load exam schedules',
    loadStudentsError: 'Failed to load students',
    loadResultsError: 'Failed to load existing results',
  },
  confirmPublish: {
    title: 'Publish Results',
    description: 'Students will be able to see their results once published. Are you sure?',
    confirm: 'Yes, Publish',
    cancel: 'Cancel',
  },
  confirmUnpublish: {
    title: 'Unpublish Results',
    description: 'Students will no longer be able to see their results. Continue?',
    confirm: 'Yes, Unpublish',
    cancel: 'Cancel',
  },
  subjectTypes: {
    MAIN_EXAM: 'Theory',
    SECONDARY_EXAM: 'Secondary',
    PRACTICAL_EXAM: 'Practical',
    ORAL_EXAM: 'Oral',
  } as Record<string, string>,
};

// ─── Report Cards Page ────────────────────────────────────────────────────────

export const REPORT_CARD_PAGE = {
  pageHeading: {
    title: 'Report Cards',
    subtitle: 'Generate and manage student report cards',
  },
  buttons: {
    generate: 'Generate Report Cards',
    publishAll: 'Publish All',
    unpublishAll: 'Unpublish All',
    viewPdf: 'View PDF',
    regenerate: 'Regenerate',
    back: 'Back',
    cancel: 'Cancel',
  },
  filters: {
    selectYear: 'Select Year',
    selectClass: 'Select Class',
    selectSection: 'Select Section',
    selectExam: 'Select Exam',
    searchPlaceholder: 'Search student…',
  },
  table: {
    sno: 'S.No.',
    studentName: 'Student Name',
    class: 'Class',
    section: 'Section',
    exam: 'Exam',
    totalMarks: 'Total Marks',
    percentage: '%',
    grade: 'Grade',
    rank: 'Rank',
    status: 'Status',
    published: 'Published',
    actions: 'Actions',
    noEntry: 'No report cards found.',
  },
  toasts: {
    generateSuccess: 'Report card(s) generated successfully',
    generateError: 'Failed to generate report cards',
    publishSuccess: 'Report cards published',
    unpublishSuccess: 'Report cards unpublished',
    publishError: 'Failed to update publish status',
    fetchError: 'Failed to load report cards',
    deleteSuccess: 'Report card deleted',
    deleteError: 'Failed to delete report card',
  },
  statusBadge: {
    PENDING: 'default',
    GENERATED: 'success',
    FAILED: 'danger',
  } as Record<string, 'default' | 'success' | 'danger' | 'warning' | 'info'>,
  generateModal: {
    title: 'Generate Report Cards',
    singleLabel: 'Single Student',
    classLabel: 'Entire Class / Section',
    remarksLabel: 'Remarks (optional)',
    remarksPlaceholder: 'e.g. Promoted to next class',
    submitLabel: 'Generate',
  },
};

// ─── Shared ───────────────────────────────────────────────────────────────────

export const RESULT_ROUTES = {
  marks: {
    list: '/result/marks',
    detail: (id: string) => `/result/marks/${id}`,
    create: '/result/marks/create-new',
  },
  reportCards: {
    list: '/result/report-cards',
    detail: (id: string) => `/result/report-cards/${id}`,
  },
} as const;

export const EXAM_TERM_LABELS: Record<string, string> = {
  TERM1: 'Term 1',
  TERM2: 'Term 2',
  TERM3: 'Term 3',
  ANNUAL: 'Annual',
};
