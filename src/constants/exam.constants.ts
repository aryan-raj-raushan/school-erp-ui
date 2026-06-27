import type { BadgeVariant } from '@/components/ui/badge';

// ── Routes ────────────────────────────────────────────────────────────────────

export const EXAM_ROUTES = {
  // Grading
  grading: {
    list: '/exam/grading',
    create: '/exam/grading/create-new',
    view: (id: string) => `/exam/grading/${id}`,
    edit: (id: string) => `/exam/grading/${id}?edit=true`,
  },
  // Exams
  exams: {
    list: '/exam/exams',
    create: '/exam/exams/create-new',
    view: (id: string) => `/exam/exams/${id}`,
    edit: (id: string) => `/exam/exams/${id}?edit=true`,
  },
  // Schedule
  schedule: {
    list: '/exam/schedule',
    create: '/exam/schedule/create-new',
    view: (id: string) => `/exam/schedule/${id}`,
    edit: (id: string) => `/exam/schedule/${id}?edit=true`,
  },
  // Attendance
  attendance: {
    list: '/exam/attendance',
    mark: '/exam/attendance/create-new',
    view: (id: string) => `/exam/attendance/view?id=${id}`,
    card: '/exam/attendance/card',
  },
  // Hall Details
  hallDetails: {
    list: '/exam/hall-details',
    create: '/exam/hall-details/view?id=create-new',
    view: (id: string) => `/exam/hall-details/view?id=${id}`,
    edit: (id: string) => `/exam/hall-details/view?id=${id}&edit=true`,
  },
  // Sitting Plan
  sittingPlan: {
    list: '/exam/sitting-plan',
    create: '/exam/sitting-plan/create-new',
    roomView: (hallDetailId: string, examId: string, academicYearId: string) =>
      `/exam/sitting-plan/view?hall_detail_id=${hallDetailId}&exam_id=${examId}&academic_year_id=${academicYearId}`,
  },
  // Admit Card
  admitCard: {
    list: '/exam/admit-card',
  },
} as const;

// ── Enum Options ──────────────────────────────────────────────────────────────

export const EXAM_TERM_OPTIONS = [
  { value: 'TERM1', label: 'Term 1' },
  { value: 'TERM2', label: 'Term 2' },
  { value: 'TERM3', label: 'Term 3' },
  { value: 'ANNUAL', label: 'Annual' },
] as const;

export const SUBJECT_TYPE_OPTIONS = [
  { value: 'MAIN_EXAM', label: 'Main Exam' },
  { value: 'SECONDARY_EXAM', label: 'Secondary Exam' },
  { value: 'PRACTICAL_EXAM', label: 'Practical Exam' },
  { value: 'ORAL_EXAM', label: 'Oral Exam' },
] as const;

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
] as const;

export const ATTENDANCE_BADGE: Record<string, BadgeVariant> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
};

// ── Grading Page ──────────────────────────────────────────────────────────────

export const GRADING_PAGE = {
  pageHeading: { title: 'Exam Grading Setup', subtitle: 'Define grade bands for all exams' },
  buttons: {
    add: 'Add Grade',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    back: 'Back',
  },
  table: {
    sno: 'S. No.',
    gradeName: 'Grade',
    fromPct: 'From %',
    toPct: 'To %',
    seqIndex: 'Order',
    description: 'Description',
    status: 'Status',
    actions: 'Actions',
    noEntry: 'No grading rules found',
  },
  labels: {
    gradeName: 'Grade Name',
    fromPercentage: 'From Percentage',
    toPercentage: 'To Percentage',
    sequenceIndex: 'Sequence / Order',
    description: 'Description',
    isEnabled: 'Enabled',
  },
  toasts: {
    createSuccess: 'Grade created successfully',
    updateSuccess: 'Grade updated successfully',
    deleteSuccess: 'Grade deleted',
    deleteError: 'Failed to delete grade',
    fetchError: 'Failed to load grades',
  },
} as const;

// ── Exams Page ────────────────────────────────────────────────────────────────

export const EXAMS_PAGE = {
  pageHeading: { title: 'Manage Exams', subtitle: '' },
  buttons: {
    add: 'Add Exam',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    back: 'Back',
    publish: 'Publish',
    unpublish: 'Unpublish',
  },
  table: {
    sno: 'S. No.',
    examName: 'Exam Name',
    term: 'Term',
    class: 'Class',
    startDate: 'Start Date',
    endDate: 'End Date',
    published: 'Published',
    status: 'Status',
    actions: 'Actions',
    noEntry: 'No exams found',
  },
  labels: {
    examName: 'Exam Name',
    academicYear: 'Academic Year',
    class: 'Class',
    examTerm: 'Exam Term',
    startDate: 'Start Date',
    endDate: 'End Date',
    includeInMarks: 'Include in Final Marks',
    isEnabled: 'Enabled',
  },
  filters: {
    allYears: 'All Years',
    allClasses: 'All Classes',
    allTerms: 'All Terms',
    allStatus: 'All Status',
  },
  toasts: {
    createSuccess: 'Exam created successfully',
    updateSuccess: 'Exam updated successfully',
    deleteSuccess: 'Exam deleted',
    publishSuccess: 'Exam published',
    unpublishSuccess: 'Exam unpublished',
    fetchError: 'Failed to load exams',
  },
} as const;

// ── Schedule Page ─────────────────────────────────────────────────────────────

export const SCHEDULE_PAGE = {
  pageHeading: { title: 'Exam Schedule', subtitle: '' },
  buttons: {
    add: 'Create Schedule',
    save: 'Save Schedule',
    cancel: 'Cancel',
    edit: 'Edit',
    back: 'Back',
    addRow: 'Add Subject',
    addSubSchedule: 'Add Sub-Subject',
    removeRow: 'Remove',
  },
  table: {
    sno: 'S. No.',
    subject: 'Subject',
    section: 'Section',
    type: 'Type',
    date: 'Date',
    time: 'Time',
    marks: 'Max Marks',
    passing: 'Pass Marks',
    invigilator: 'Invigilator',
    room: 'Room',
    actions: 'Actions',
    noEntry: 'No schedules found',
  },
  labels: {
    exam: 'Exam',
    academicYear: 'Academic Year',
    class: 'Class',
    section: 'Section',
    subject: 'Subject Name',
    subjectType: 'Subject Type',
    examDate: 'Exam Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    examMarks: 'Max Marks',
    passingMarks: 'Passing Marks',
    invigilator: 'Invigilator',
    room: 'Room / Hall',
    subSubjectEnabled: 'Enable Sub-Subjects',
  },
  filters: {
    allYears: 'All Years',
    allClasses: 'All Classes',
    allSections: 'All Sections',
    allExams: 'All Exams',
    allTypes: 'All Types',
  },
  toasts: {
    createSuccess: 'Schedule created successfully',
    updateSuccess: 'Schedule updated',
    deleteSuccess: 'Schedule deleted',
    fetchError: 'Failed to load schedules',
    conflictError: 'Time slot conflict detected',
  },
} as const;

// ── Attendance Page ───────────────────────────────────────────────────────────

export const ATTENDANCE_PAGE = {
  pageHeading: { title: 'Exam Attendance', subtitle: '' },
  buttons: {
    mark: 'Mark Attendance',
    save: 'Save Attendance',
    cancel: 'Cancel',
    back: 'Back',
    downloadCard: 'Download Attendance Card',
  },
  table: {
    sno: 'S. No.',
    student: 'Student',
    rollNo: 'Roll No.',
    schedule: 'Exam / Subject',
    status: 'Status',
    remarks: 'Remarks',
    actions: 'Actions',
    noEntry: 'No attendance records found',
  },
  labels: {
    exam: 'Exam',
    academicYear: 'Academic Year',
    class: 'Class',
    section: 'Section',
    schedule: 'Subject / Schedule',
    status: 'Attendance Status',
    remarks: 'Remarks',
    markAll: 'Mark All Present',
    markAllAbsent: 'Mark All Absent',
  },
  filters: {
    allYears: 'All Years',
    allExams: 'All Exams',
    allSchedules: 'All Schedules',
    allStatus: 'All Status',
  },
  toasts: {
    saveSuccess: 'Attendance saved successfully',
    saveError: 'Failed to save attendance',
    fetchError: 'Failed to load attendance',
  },
} as const;

// ── Hall Plans Page ───────────────────────────────────────────────────────────

// ── Hall Details Page ─────────────────────────────────────────────────────────

export const HALL_DETAILS_PAGE = {
  pageHeading: { title: 'Exam Hall Rooms', subtitle: 'Manage exam rooms and seating capacity' },
  buttons: {
    add: 'Add Room',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    back: 'Back',
  },
  table: {
    sno: 'S. No.',
    roomName: 'Room Name',
    capacity: 'Sitting Capacity',
    status: 'Status',
    actions: 'Actions',
    noEntry: 'No rooms found',
  },
  labels: {
    roomName: 'Room Name',
    sittingCapacity: 'Sitting Capacity',
    isEnabled: 'Enabled',
  },
  toasts: {
    createSuccess: 'Room created',
    updateSuccess: 'Room updated',
    deleteSuccess: 'Room deleted',
    fetchError: 'Failed to load rooms',
  },
} as const;

// ── Sitting Plan Page ─────────────────────────────────────────────────────────

export const SITTING_PLAN_PAGE = {
  pageHeading: { title: 'Exam Sitting Plan', subtitle: 'Assign students to exam rooms' },
  buttons: {
    assign: 'Assign Students',
    save: 'Save Plan',
    cancel: 'Cancel',
    back: 'Back',
    autoAssign: 'Auto Assign',
  },
  table: {
    sno: 'S. No.',
    student: 'Student',
    rollNo: 'Roll No.',
    room: 'Room',
    seatNo: 'Seat No.',
    actions: 'Actions',
    noEntry: 'No sitting plan entries found',
  },
  labels: {
    exam: 'Exam',
    academicYear: 'Academic Year',
    room: 'Room',
    student: 'Student',
    seatNumber: 'Seat Number',
    rollNumber: 'Roll Number',
  },
  filters: {
    allYears: 'All Years',
    allExams: 'All Exams',
    allPlans: 'All Plans',
    allRooms: 'All Rooms',
  },
  toasts: {
    createSuccess: 'Sitting plan saved',
    deleteSuccess: 'Entry removed',
    fetchError: 'Failed to load sitting plan',
    capacityError: 'Room capacity exceeded',
  },
} as const;

// ── Admit Card Page ───────────────────────────────────────────────────────────

export const ADMIT_CARD_PAGE = {
  pageHeading: { title: 'Student Admit Cards', subtitle: 'Generate and download admit cards' },
  buttons: {
    generate: 'Generate',
    download: 'Download PDF',
    back: 'Back',
  },
  labels: {
    academicYear: 'Academic Year',
    exam: 'Exam',
    student: 'Student',
    searchStudent: 'Search student…',
  },
  preview: {
    title: 'Admit Card Preview',
    noData: 'Select an exam and student to preview the admit card',
    school: 'School',
    student: 'Student',
    class: 'Class',
    section: 'Section',
    rollNo: 'Roll No.',
    admissionNo: 'Admission No.',
    examName: 'Exam',
    term: 'Term',
    timetable: 'Exam Timetable',
    subject: 'Subject',
    date: 'Date',
    time: 'Time',
    maxMarks: 'Max Marks',
    passingMarks: 'Pass Marks',
    principalSign: "Principal's Signature",
    studentSign: "Student's Signature",
  },
  toasts: {
    fetchError: 'Failed to load admit card data',
  },
} as const;