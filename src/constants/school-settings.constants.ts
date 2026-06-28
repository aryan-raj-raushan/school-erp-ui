import type { AttendanceMethod, ConflictResolutionMode, TimingType } from '@/types/school-settings.types';

export const SCHOOL_CONFIG_PAGE = {
  title: 'School Configuration',
  subtitle: 'Configure attendance rules, lock policy, and conflict resolution',
};

export const TIMINGS_PAGE = {
  title: 'School Timing Schedules',
  subtitle: 'Manage seasonal and special timing schedules',
  addButton: 'Add Timing',
};

export const CLASS_TIMINGS_PAGE = {
  title: 'Class Timing Overrides',
  subtitle: 'Assign specific timing schedules to individual classes',
};

export const ATTENDANCE_METHOD_OPTIONS: { value: AttendanceMethod; label: string }[] = [
  { value: 'MANUAL', label: 'Manual Only' },
  { value: 'RFID', label: 'RFID Only' },
  { value: 'BOTH', label: 'Manual + RFID' },
  { value: 'BIOMETRIC', label: 'Biometric' },
  { value: 'QR', label: 'QR Code' },
];

export const CONFLICT_RESOLUTION_OPTIONS: { value: ConflictResolutionMode; label: string; description: string }[] = [
  { value: 'MANUAL_WINS', label: 'Manual Wins', description: 'Teacher marking overrides RFID' },
  { value: 'RFID_WINS', label: 'RFID Wins', description: 'RFID tap overrides teacher marking' },
  { value: 'FLAG_FOR_REVIEW', label: 'Flag for Review', description: 'Conflicts go to admin queue' },
];

export const TIMING_TYPE_OPTIONS: { value: TimingType; label: string }[] = [
  { value: 'DEFAULT', label: 'Default' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'WINTER', label: 'Winter' },
  { value: 'EXAM', label: 'Exam Period' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'RAMADAN', label: 'Ramadan' },
  { value: 'SPECIAL', label: 'Special' },
];

export const TIMING_TYPE_BADGE: Record<TimingType, { label: string; variant: string }> = {
  DEFAULT: { label: 'Default', variant: 'secondary' },
  SUMMER: { label: 'Summer', variant: 'warning' },
  WINTER: { label: 'Winter', variant: 'info' },
  EXAM: { label: 'Exam', variant: 'destructive' },
  SATURDAY: { label: 'Saturday', variant: 'outline' },
  RAMADAN: { label: 'Ramadan', variant: 'purple' },
  SPECIAL: { label: 'Special', variant: 'success' },
};

export const WORKING_DAY_OPTIONS = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
];

export const DEFAULT_WORKING_DAYS = 'MON,TUE,WED,THU,FRI';
