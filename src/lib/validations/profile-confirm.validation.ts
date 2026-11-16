import { z } from 'zod';
import { REGEX } from '@/constants';

const optionalText = (max: number) => z.string().trim().max(max, `Must be at most ${max} characters`).optional();

export const profileConfirmSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100, 'Must be at most 100 characters'),
  last_name: optionalText(100),
  email: z.union([z.string().trim().regex(REGEX.email, 'Invalid email'), z.literal('')]).optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  blood_group: z.string().optional(),
  address: optionalText(500),
  city: optionalText(100),
  alternate_phone: z
    .union([z.string().regex(REGEX.phoneIn, 'Enter a valid 10-digit mobile number'), z.literal('')])
    .optional(),
  occupation: optionalText(100),
});

export type ProfileConfirmFormValues = z.infer<typeof profileConfirmSchema>;
