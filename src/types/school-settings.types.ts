export type AttendanceMethod = 'MANUAL' | 'RFID' | 'BOTH' | 'BIOMETRIC' | 'QR';
export type ConflictResolutionMode = 'MANUAL_WINS' | 'RFID_WINS' | 'FLAG_FOR_REVIEW';
export type TimingType = 'SUMMER' | 'WINTER' | 'EXAM' | 'SATURDAY' | 'RAMADAN' | 'SPECIAL' | 'DEFAULT';

export interface SchoolSettings {
  id: string;
  school_id: string;
  attendance_method: AttendanceMethod;
  attendance_lock_hours: number;
  three_lates_equal_half_day: boolean;
  two_half_days_equal_leave: boolean;
  auto_notify_parent_on_absent: boolean;
  conflict_resolution_mode: ConflictResolutionMode;
  created_at: string;
  updated_at: string;
}

export interface SchoolTiming {
  id: string;
  school_id: string;
  name: string;
  timing_type: TimingType;
  school_start_time: string;
  school_end_time: string;
  grace_period_minutes: number;
  late_cutoff_time: string | null;
  half_day_cutoff_time: string | null;
  absent_cutoff_time: string | null;
  working_days: string;
  period_duration_minutes: number;
  lunch_start_time: string | null;
  lunch_end_time: string | null;
  effective_from: string;
  effective_to: string;
  priority: number;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassTimingOverride {
  id: string;
  class_id: string;
  school_id: string;
  timing_id: string | null;
  created_at: string;
}

export interface UpdateSchoolSettingsPayload {
  attendance_method?: AttendanceMethod;
  attendance_lock_hours?: number;
  three_lates_equal_half_day?: boolean;
  two_half_days_equal_leave?: boolean;
  auto_notify_parent_on_absent?: boolean;
  conflict_resolution_mode?: ConflictResolutionMode;
}

export interface CreateSchoolTimingPayload {
  name: string;
  timing_type: TimingType;
  school_start_time: string;
  school_end_time: string;
  grace_period_minutes?: number;
  late_cutoff_time?: string;
  half_day_cutoff_time?: string;
  absent_cutoff_time?: string;
  working_days?: string;
  period_duration_minutes?: number;
  lunch_start_time?: string;
  lunch_end_time?: string;
  effective_from: string;
  effective_to: string;
  priority?: number;
}

export interface UpdateSchoolTimingPayload extends Partial<CreateSchoolTimingPayload> {
  is_active?: boolean;
}

export interface SetClassTimingPayload {
  timing_id: string | null;
}
