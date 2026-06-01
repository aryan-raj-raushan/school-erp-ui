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
