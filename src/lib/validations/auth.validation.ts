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

export type CompanyLoginFormValues = z.infer<typeof companyLoginSchema>;
export type SchoolLoginFormValues = z.infer<typeof schoolLoginSchema>;
