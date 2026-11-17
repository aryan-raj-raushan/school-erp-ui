import type { AttendanceMode } from '@/services/staff-attendance.service';

export const ATTENDANCE_MODE_LABEL: Record<AttendanceMode, string> = {
  MANUAL: 'Manual',
  RFID: 'Smart card',
  APP: 'App',
};

export function localDateISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function attendanceLockReason(mode: AttendanceMode | undefined, date: string): string | null {
  if (mode === 'RFID') return 'Marked by smart card — cannot be edited';
  if (mode === 'APP' && date === localDateISO()) return 'Punched in from the app — locked for today';
  return null;
}

export function formatMarkedTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function mapLink(latitude: string | number, longitude: string | number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
