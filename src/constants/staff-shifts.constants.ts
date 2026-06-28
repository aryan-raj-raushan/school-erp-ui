import type { ShiftType } from '@/types/staff-shifts.types';

export const STAFF_SHIFTS_PAGE = {
  title: 'Staff Shift Management',
  subtitle: 'Assign and manage work shift schedules for staff members',
  addButton: 'Assign Shift',
};

export const SHIFT_TYPE_OPTIONS: { value: ShiftType; label: string }[] = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SPLIT', label: 'Split' },
];

export const SHIFT_TYPE_BADGE: Record<ShiftType, { label: string; variant: string }> = {
  MORNING: { label: 'Morning', variant: 'info' },
  AFTERNOON: { label: 'Afternoon', variant: 'warning' },
  EVENING: { label: 'Evening', variant: 'purple' },
  NIGHT: { label: 'Night', variant: 'secondary' },
  ADMIN: { label: 'Admin', variant: 'outline' },
  SPLIT: { label: 'Split', variant: 'success' },
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
