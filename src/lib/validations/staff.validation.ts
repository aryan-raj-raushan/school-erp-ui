import { z } from 'zod';
import {
  requiredNameSchema,
  optionalNameSchema,
  indianPhoneSchema,
  dialCodeSchema,
  optionalEmailSchema,
} from './common.validation';
import { SALUTATIONS } from '@/constants/person.constants';

export const staffBaseSchema = z.object({
  salutation: z.enum(SALUTATIONS).optional().or(z.literal('')),
  first_name: requiredNameSchema(100),
  last_name: optionalNameSchema(100),
  dial_code: dialCodeSchema,
  phone_number: indianPhoneSchema,
  email: optionalEmailSchema,
  role: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender is required' }),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
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

const optionalPassword = z.string().min(6, 'Min 6 characters').optional().or(z.literal(''));

export const createStaffSchema = staffBaseSchema.extend({ password: optionalPassword });

export const updateStaffSchema = staffBaseSchema.extend({ password: optionalPassword });

export type StaffFormValues = z.infer<typeof updateStaffSchema>;
