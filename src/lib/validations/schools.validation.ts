import { z } from 'zod';
import { REGEX, BOARD_TYPES } from '@/constants';

const optionalEmail = z.union([z.string().regex(REGEX.email, 'Invalid email'), z.literal('')]).optional();
const optionalUrl = z.union([z.string().regex(REGEX.url, 'Invalid URL'), z.literal('')]).optional();
const optionalPhone = z.union([z.string().regex(REGEX.phone, 'Invalid phone number'), z.literal('')]).optional();

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  code: z.string().optional(),
  email: optionalEmail,
  dial_code: z.string().regex(REGEX.dialCode, 'Invalid dial code').optional(),
  contact_number: optionalPhone,
  website: optionalUrl,
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  board_type: z.enum(BOARD_TYPES).optional(),
});

export type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>;

export const updateSchoolSchema = createSchoolSchema.partial();
export type UpdateSchoolFormValues = z.infer<typeof updateSchoolSchema>;
