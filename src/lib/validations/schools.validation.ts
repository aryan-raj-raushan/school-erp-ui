import { z } from 'zod';
import { REGEX, BOARD_TYPES } from '@/constants';

const optionalEmail = z.union([z.string().regex(REGEX.email, 'Invalid email'), z.literal('')]).optional();
const optionalUrl = z.union([z.string().regex(REGEX.url, 'Enter a valid website, e.g. school.edu.in'), z.literal('')]).optional();
const optionalPhone = z.union([z.string().regex(REGEX.phoneIn, 'Enter a valid 10-digit mobile number'), z.literal('')]).optional();
const optionalText = (max: number) => z.string().trim().max(max, `Must be at most ${max} characters`).optional();

type SchoolAdminFields = {
  admin_first_name?: string;
  admin_last_name?: string;
  admin_phone?: string;
  admin_email?: string;
};

function refineSchoolAdmin(data: SchoolAdminFields, ctx: z.RefinementCtx) {
  const hasLogin = Boolean(data.admin_phone || data.admin_email);
  if (hasLogin && !data.admin_first_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['admin_first_name'],
      message: 'Admin first name is required when an admin phone or email is provided',
    });
  }
  if (!hasLogin && (data.admin_first_name || data.admin_last_name)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['admin_phone'],
      message: 'Enter a phone number or email so the admin can log in',
    });
  }
}

const schoolFields = {
  name: z.string().trim().min(1, 'School name is required').max(150, 'Must be at most 150 characters'),
  email: optionalEmail,
  dial_code: z.string().regex(REGEX.dialCode, 'Invalid dial code').optional(),
  contact_number: optionalPhone,
  website: optionalUrl,
  address: optionalText(500),
  city: optionalText(100),
  state: optionalText(100),
  pincode: z.union([z.string().regex(REGEX.pincodeIn, 'Enter a valid 6-digit pincode'), z.literal('')]).optional(),
  board_type: z.enum(BOARD_TYPES).optional().or(z.literal('')),
};

const createSchoolObjectSchema = z.object({
  ...schoolFields,
  admin_first_name: optionalText(100),
  admin_last_name: optionalText(100),
  admin_dial_code: z.string().regex(REGEX.dialCode, 'Invalid dial code').optional(),
  admin_phone: optionalPhone,
  admin_email: optionalEmail,
});

export const createSchoolSchema = createSchoolObjectSchema.superRefine(refineSchoolAdmin);

export type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>;

const updateSchoolObjectSchema = z.object({
  ...schoolFields,
  admin_first_name: optionalText(100),
  admin_last_name: optionalText(100),
  admin_dial_code: z.string().regex(REGEX.dialCode, 'Invalid dial code').optional(),
  admin_phone: optionalPhone,
  admin_email: optionalEmail,
}).partial();

export const updateSchoolSchema = updateSchoolObjectSchema.superRefine(refineSchoolAdmin);

export type UpdateSchoolFormValues = z.infer<typeof updateSchoolSchema>;
