import { z } from 'zod';

// ─── Leave Type ───────────────────────────────────────────────────────────────
export const leaveTypeSchema = z.object({
  leave_name: z.string().min(1, 'Leave name is required').max(100),
  leave_validity: z.enum(['MONTHLY', 'YEARLY', 'ON_OCCASION'], 'Please select leave validity'),
  leave_pay_type: z.enum(['PAID', 'UNPAID'], 'Please select pay type'),
  leave_count_days: z
    .number({ message: 'Must be a number' })
    .int()
    .min(1, 'Must be at least 1 day'),
  is_enabled: z.boolean(),
});
export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;

// ─── Assign Leave ─────────────────────────────────────────────────────────────
export const assignLeaveSchema = z.object({
  leave_type_id: z.string().uuid('Please select a leave type'),
  academic_year_id: z.string().uuid('Please select an academic year'),
});
export type AssignLeaveFormValues = z.infer<typeof assignLeaveSchema>;

// ─── Apply Leave ──────────────────────────────────────────────────────────────
export const applyLeaveSchema = z
  .object({
    leave_type_id: z.string().uuid('Please select a leave type'),
    academic_year_id: z.string().uuid('Please select an academic year'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    reason: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });
export type ApplyLeaveFormValues = z.infer<typeof applyLeaveSchema>;

// ─── Review Leave ─────────────────────────────────────────────────────────────
export const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().max(500).optional(),
});
export type ReviewLeaveFormValues = z.infer<typeof reviewLeaveSchema>;



export const adminApplyLeaveSchema = z
  .object({
    // 'self' = apply for logged-in admin; 'behalf' = on behalf of employee
    apply_mode: z.enum(['self', 'behalf']),
    employee_id: z.string().optional(),
    academic_year_id: z.string().uuid('Please select an academic year'),
    leave_type_id: z.string().uuid('Please select a leave type'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    reason: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.apply_mode === 'behalf') {
        return !!data.employee_id && data.employee_id.length > 0;
      }
      return true;
    },
    { message: 'Please select an employee', path: ['employee_id'] },
  )
  .refine(
    (data) =>
      !data.start_date ||
      !data.end_date ||
      new Date(data.end_date) >= new Date(data.start_date),
    { message: 'End date must be on or after start date', path: ['end_date'] },
  );

export type AdminApplyLeaveFormValues = z.infer<typeof adminApplyLeaveSchema>;