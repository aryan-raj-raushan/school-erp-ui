import { z } from 'zod';
import { REGEX, BOARD_TYPES } from '@/constants';
import { strongPasswordRegex } from './auth.validation';

const optionalEmail = z.union([z.string().regex(REGEX.email, 'Invalid email'), z.literal('')]).optional();
const optionalUrl = z.union([z.string().regex(REGEX.url, 'Invalid URL'), z.literal('')]).optional();
const optionalPhone = z.union([z.string().regex(REGEX.phone, 'Invalid phone number'), z.literal('')]).optional();
const optionalPassword = z
  .union([z.string().regex(strongPasswordRegex, 'Password must include uppercase, lowercase, number and special character'), z.literal('')])
  .optional();

const schoolFields = {
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
};

const createSchoolObjectSchema = z.object({
  ...schoolFields,
  admin_first_name: z.string().optional(),
  admin_last_name: z.string().optional(),
  admin_dial_code: z.string().regex(REGEX.dialCode, 'Invalid dial code').optional(),
  admin_phone: optionalPhone,
  admin_email: optionalEmail,
  admin_password: optionalPassword,
});

export const createSchoolSchema = createSchoolObjectSchema.superRefine((data, ctx) => {
  if ((data.admin_phone || data.admin_email) && !data.admin_first_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['admin_first_name'],
      message: 'Admin first name is required when an admin phone or email is provided',
    });
  }
  if (data.admin_password && !data.admin_phone && !data.admin_email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['admin_password'],
      message: 'Admin phone or email is required to set an initial password',
    });
  }
});

export type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>;

const updateSchoolObjectSchema = z.object({
  ...schoolFields,
  admin_first_name: z.string().optional(),
  admin_last_name: z.string().optional(),
  admin_dial_code: z.string().regex(REGEX.dialCode, 'Invalid dial code').optional(),
  admin_phone: optionalPhone,
  admin_email: optionalEmail,
  admin_password: optionalPassword,
}).partial();

export const updateSchoolSchema = updateSchoolObjectSchema.superRefine((data, ctx) => {
  if ((data.admin_phone || data.admin_email) && !data.admin_first_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['admin_first_name'],
      message: 'Admin first name is required when an admin phone or email is provided',
    });
  }
  if (data.admin_password && !data.admin_phone && !data.admin_email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['admin_password'],
      message: 'Admin phone or email is required to set a password',
    });
  }
});

export type UpdateSchoolFormValues = z.infer<typeof updateSchoolSchema>;
