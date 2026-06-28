export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ADMIN' | 'SPLIT';

export interface StaffShift {
  id: string;
  school_id: string;
  staff_id: string;
  shift_name: string;
  shift_type: ShiftType;
  shift_start: string;
  shift_end: string;
  grace_period_minutes: string;
  working_days: string;
  effective_from: string;
  effective_to: string;
  is_active: string;
  created_at: string;
  updated_at: string | null;
}

export interface CreateStaffShiftPayload {
  staff_id: string;
  shift_name: string;
  shift_type: ShiftType;
  shift_start: string;
  shift_end: string;
  grace_period_minutes?: number;
  working_days?: string;
  effective_from: string;
  effective_to: string;
}

export interface UpdateStaffShiftPayload extends Partial<Omit<CreateStaffShiftPayload, 'staff_id'>> {
  is_active?: string;
}
