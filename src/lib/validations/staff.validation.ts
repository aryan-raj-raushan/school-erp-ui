import { z } from 'zod';
import {
  requiredNameSchema,
  optionalNameSchema,
  indianPhoneSchema,
  dialCodeSchema,
  optionalEmailSchema,
} from './common.validation';
import { SALUTATIONS } from '@/constants/person.constants';
import { strongPasswordRegex } from './auth.validation';

export const staffBaseSchema = z.object({
  salutation: z.enum(SALUTATIONS).optional().or(z.literal('')),
  first_name: requiredNameSchema(100),
  last_name: optionalNameSchema(100),
  dial_code: dialCodeSchema,
  phone_number: indianPhoneSchema,
  email: optionalEmailSchema,
  role: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender is required' }),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((v) => v < new Date().toLocaleDateString('en-CA'), {
      message: 'Date of birth must be in the past',
    }),
  blood_group: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional().or(z.literal('')),
  address: z.string().optional(),
  permanent_address: z.string().optional(),
  city: z.string().max(100).optional(),
  joining_date: z.string().optional(),
  employee_code: z.string().max(50).optional(),
  // Picker value only — the id of the selected row in the /roles list (system or
  // custom). Resolved into `role` (enum) / `custom_role_id` at submit time.
  role_id: z.string().min(1, 'Role is required'),
  custom_role_id: z.string().optional(),
  father_name: z.string().max(100).optional(),
  husband_name: z.string().max(100).optional(),
  reporting_to_id: z.string().optional(),
  rfid_card_number: z.string().max(50).optional(),
  qualification: z.string().max(255).optional(),
  previous_employer: z.string().max(255).optional(),
  previous_role: z.string().max(100).optional(),
  total_experience: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
});

const optionalPassword = z
  .string()
  .refine((v) => v === '' || strongPasswordRegex.test(v), {
    message: 'Use 8+ characters with uppercase, lowercase, a number and a special character (@$!%*?&)',
  })
  .optional();

function joiningAfterBirth(values: { date_of_birth?: string; joining_date?: string }, ctx: z.RefinementCtx) {
  if (values.joining_date && values.date_of_birth && values.joining_date <= values.date_of_birth) {
    ctx.addIssue({
      code: 'custom',
      path: ['joining_date'],
      message: 'Joining date must be after date of birth',
    });
  }
}

export const createStaffSchema = staffBaseSchema
  .extend({ password: optionalPassword })
  .superRefine(joiningAfterBirth);

export const updateStaffSchema = staffBaseSchema
  .extend({ password: optionalPassword })
  .superRefine(joiningAfterBirth);

export type StaffFormValues = z.infer<typeof updateStaffSchema>;
