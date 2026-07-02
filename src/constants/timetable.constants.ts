import type { DayOfWeek } from '@/services/timetable.service';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

export const MAX_PERIODS_OPTIONS = [4, 5, 6, 7, 8, 9, 10];

export const SCHOOL_TIMETABLE_PAGE = {
  title: 'Time Table',
  addButton: 'Add Time Table',
  empty: 'No timetables found',
  form: {
    createTitle: 'Add Time Table',
    editTitle: 'Edit Time Table',
    name: 'Timetable Name *',
    academicYear: 'Academic Year',
    class: 'Class',
    maxPeriods: 'Max Periods *',
    classTeacher: 'Class Teacher',
    cancel: 'Cancel',
    submit: 'Save Timetable',
    periodTimes: 'Period Times',
    periods: 'Periods',
    startTime: 'Start',
    endTime: 'End',
  },
  placeholders: {
    name: 'e.g. 2024-25 Grade 10 A Timetable',
    selectAcademicYear: 'Select academic year',
    selectClass: 'Select class',
    selectTeacher: 'Select teacher',
    selectSubject: 'Select subject',
  },
  table: {
    name: 'Name',
    class: 'Class',
    maxPeriods: 'Periods',
    status: 'Status',
    actions: 'Actions',
  },
  employee: {
    title: 'Employee Timetable',
    selectTeacher: 'Select Teacher',
    empty: 'No schedule found',
  },
  session: {
    title: 'Day Schedule',
    selectDay: 'Select Day',
    empty: 'No classes scheduled',
  },
  autoGenerate: {
    tabLabel: 'Auto Generate',
    manualTabLabel: 'Manual',
    timingLabel: 'Timing Profile',
    selectTiming: 'Select timing profile',
    generateButton: 'Auto Create Timetable',
    noMapping: 'No subject-teacher mapping found for this class.',
    noMappingLink: 'Set it up on the Subject-Teacher Map page',
    previewTitle: 'Subjects & Teachers used for this class',
    previewSummaryTitle: 'Schedule Preview',
    conflictsTitle: 'periods could not be auto-assigned due to teacher clashes',
    lunchAfterLabel: 'Insert Lunch After Period #',
    lunchAfterPlaceholder: 'e.g. 4',
    lunchDurationLabel: 'Lunch Duration (min)',
    lunchDurationPlaceholder: 'e.g. 30',
  },
} as const;
