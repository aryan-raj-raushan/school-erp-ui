import { z } from 'zod';
import { REGEX } from '@/constants';

export const companyLoginSchema = z.object({
  email: z.string().regex(REGEX.email, 'Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const schoolLoginSchema = z.object({
  dial_code: z.string().regex(REGEX.dialCode, 'Enter a valid dial code (e.g. +91)'),
  phone_number: z.string().regex(REGEX.phone, 'Enter a valid phone number'),
  password: z.string().min(1, 'Password is required'),
});

export const unifiedLoginSchema = z
  .object({
    identifier: z.string().min(1, 'Email or phone number is required'),
    dial_code: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .superRefine((data, ctx) => {
    const isEmail = REGEX.email.test(data.identifier);
    const isPhone = REGEX.phone.test(data.identifier);
    if (!isEmail && !isPhone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['identifier'], message: 'Enter a valid email or phone number' });
    }
    if (isPhone && (!data.dial_code || !REGEX.dialCode.test(data.dial_code))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dial_code'], message: 'Enter a valid dial code (e.g. +91)' });
    }
  });

export type CompanyLoginFormValues = z.infer<typeof companyLoginSchema>;
export type SchoolLoginFormValues = z.infer<typeof schoolLoginSchema>;
export type UnifiedLoginFormValues = z.infer<typeof unifiedLoginSchema>;

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const schoolSignupSchema = z.object({
  school_name: z.string().min(1, 'School name is required'),
  school_code: z.string().optional(),
  board_type: z.string().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  dial_code: z.string().default('+91'),
  phone_number: z.string().regex(REGEX.phone, 'Enter a valid phone number'),
  email: z
    .string()
    .optional()
    .refine((v) => !v || REGEX.email.test(v), { message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(strongPasswordRegex, 'Password must include uppercase, lowercase, number and special character'),
});

export const setupPasswordSchema = z
  .object({
    setup_token: z.string().min(1, 'Setup token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(strongPasswordRegex, 'Password must include uppercase, lowercase, number and special character'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type SchoolSignupFormValues = z.infer<typeof schoolSignupSchema>;
export type SetupPasswordFormValues = z.infer<typeof setupPasswordSchema>;
