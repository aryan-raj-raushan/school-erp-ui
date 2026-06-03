import type { BadgeVariant } from '@/components/ui/badge';
import type { AttendanceStatus } from '@/types';

export const ATTENDANCE_STATUS_BADGE: Record<AttendanceStatus, BadgeVariant> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  HALF_DAY: 'info',
  EXCUSED: 'default',
  HOLIDAY: 'default',
};

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'EXCUSED', label: 'Excused' },
  { value: 'HOLIDAY', label: 'Holiday' },
] as const;

export const ATTENDANCE_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  ...ATTENDANCE_STATUS_OPTIONS,
] as const;

export const STUDENT_ATTENDANCE_PAGE = {
  title: 'Student Attendance',
  selectSection: 'Select Class Section',
  selectDate: 'Date',
  markAllPresent: 'Mark All Present',
  markAllAbsent: 'Mark All Absent',
  save: 'Save Attendance',
  saving: 'Saving...',
  table: {
    student: 'Student',
    admissionNo: 'Admission No.',
    rollNo: 'Roll No.',
    status: 'Status',
    remarks: 'Remarks',
  },
  empty: 'Select a class section to load students.',
  noStudents: 'No students found in this section.',
  saved: 'Attendance saved',
} as const;

export const ATTENDANCE_REPORT_PAGE = {
  title: 'Attendance Reports',
  tabs: {
    daily: 'Daily Report',
    monthly: 'Monthly Summary',
    defaulters: 'Defaulters',
    studentHistory: 'Student History',
  },
  daily: {
    selectSection: 'Class Section',
    selectDate: 'Date',
    fetch: 'Fetch Report',
    stats: {
      total: 'Total',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      percentage: 'Attendance %',
    },
    table: {
      student: 'Student',
      status: 'Status',
      remarks: 'Remarks',
    },
    empty: 'No attendance data for selected date.',
  },
  monthly: {
    selectSection: 'Class Section',
    selectMonth: 'Month',
    selectYear: 'Year',
    fetch: 'Fetch Summary',
    table: {
      student: 'Student',
      totalDays: 'Total Days',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      percentage: 'Percentage',
    },
    empty: 'No data for selected month.',
  },
  defaulters: {
    selectSection: 'Class Section (optional)',
    threshold: 'Min. Attendance % (threshold)',
    fetch: 'Fetch Defaulters',
    table: {
      student: 'Student',
      admissionNo: 'Admission No.',
      class: 'Class / Section',
      percentage: 'Attendance %',
      present: 'Present',
      absent: 'Absent',
    },
    empty: 'No defaulters found.',
  },
  studentHistory: {
    studentId: 'Student ID',
    fetch: 'Fetch History',
    table: {
      date: 'Date',
      status: 'Status',
      remarks: 'Remarks',
    },
    empty: 'No history found.',
  },
  export: 'Export',
} as const;
