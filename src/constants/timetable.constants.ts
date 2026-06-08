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
    classDetail: 'Class Detail',
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
    selectClassDetail: 'Select class detail',
    selectTeacher: 'Select teacher',
    selectSubject: 'Select subject',
  },
  table: {
    name: 'Name',
    class: 'Class',
    classDetail: 'Class Detail',
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
} as const;
