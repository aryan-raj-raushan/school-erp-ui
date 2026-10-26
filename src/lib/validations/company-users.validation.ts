import { z } from 'zod';
import { REGEX } from '@/constants';
import { Role } from '@/types';
import { strongPasswordRegex } from './auth.validation';

const ASSIGNABLE_ROLES = [Role.ADMIN, Role.SUPPORT, Role.SALES, Role.OPERATOR] as const;
const NAME_MESSAGE = 'Use letters, spaces, dots, apostrophes or hyphens only';
const firstNameSchema = z.string().trim().min(1, 'First name is required').max(100).regex(REGEX.personName, NAME_MESSAGE);
const lastNameSchema = z.string().trim().max(100).regex(REGEX.personName, NAME_MESSAGE).optional().or(z.literal(''));

export const createCompanyUserSchema = z.object({
  first_name: firstNameSchema,
  last_name: lastNameSchema,
  email: z.string().regex(REGEX.email, 'Invalid email address'),
  password: z.string().regex(strongPasswordRegex, 'Password must include uppercase, lowercase, number and special character'),
  role: z.enum(ASSIGNABLE_ROLES),
});

export type CreateCompanyUserFormValues = z.infer<typeof createCompanyUserSchema>;

export const updateCompanyUserSchema = z.object({
  first_name: firstNameSchema.optional(),
  last_name: lastNameSchema,
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateCompanyUserFormValues = z.infer<typeof updateCompanyUserSchema>;
