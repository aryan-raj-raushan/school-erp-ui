import { z } from 'zod';
import {
  requiredNameSchema,
  optionalNameSchema,
  indianPhoneSchema,
  dialCodeSchema,
  optionalEmailSchema,
} from './common.validation';

export const guardianSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'GRANDPARENT', 'SIBLING', 'OTHER'], {
    message: 'Relation is required',
  }),
  first_name: requiredNameSchema(100),
  last_name: optionalNameSchema(100),
  phone_number: indianPhoneSchema,
  dial_code: dialCodeSchema,
  email: optionalEmailSchema,
  occupation: z.string().optional(),
  is_primary: z.boolean().optional(),
  can_pickup: z.boolean().optional(),
});

export type GuardianFormValues = z.infer<typeof guardianSchema>;
