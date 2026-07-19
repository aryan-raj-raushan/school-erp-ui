import { z } from 'zod';
import { REGEX } from '@/constants';
import { Role } from '@/types';
import { strongPasswordRegex } from './auth.validation';

const ASSIGNABLE_ROLES = [Role.ADMIN, Role.SUPPORT, Role.SALES, Role.OPERATOR] as const;

export const createCompanyUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().regex(REGEX.email, 'Invalid email address'),
  password: z.string().regex(strongPasswordRegex, 'Password must include uppercase, lowercase, number and special character'),
  role: z.enum(ASSIGNABLE_ROLES),
});

export type CreateCompanyUserFormValues = z.infer<typeof createCompanyUserSchema>;

export const updateCompanyUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().optional(),
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateCompanyUserFormValues = z.infer<typeof updateCompanyUserSchema>;
