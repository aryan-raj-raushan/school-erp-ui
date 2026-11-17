import { z } from 'zod';
import { REGEX } from '@/constants';
import { Role } from '@/types';
import { strongPasswordRegex } from './auth.validation';

export const ASSIGNABLE_ROLES = [Role.ADMIN, Role.SUPPORT, Role.SALES, Role.OPERATOR] as const;
export const CUSTOM_ROLE_PREFIX = 'custom:';

const NAME_MESSAGE = 'Use letters, spaces, dots, apostrophes or hyphens only';
const firstNameSchema = z.string().trim().min(1, 'First name is required').max(100).regex(REGEX.personName, NAME_MESSAGE);
const lastNameSchema = z.string().trim().max(100).regex(REGEX.personName, NAME_MESSAGE).optional().or(z.literal(''));
const roleChoiceSchema = z
  .string()
  .min(1, 'Select a role')
  .refine(
    (value) => (ASSIGNABLE_ROLES as readonly string[]).includes(value) || value.startsWith(CUSTOM_ROLE_PREFIX),
    'Select a role',
  );

export const createCompanyUserSchema = z.object({
  first_name: firstNameSchema,
  last_name: lastNameSchema,
  email: z.string().regex(REGEX.email, 'Invalid email address'),
  password: z.string().regex(strongPasswordRegex, 'Password must include uppercase, lowercase, number and special character'),
  role_choice: roleChoiceSchema,
});

export type CreateCompanyUserFormValues = z.infer<typeof createCompanyUserSchema>;

export const updateCompanyUserSchema = z.object({
  first_name: firstNameSchema,
  last_name: lastNameSchema,
  email: z.string().regex(REGEX.email, 'Invalid email address'),
  role_choice: roleChoiceSchema,
  is_active: z.boolean(),
});

export type UpdateCompanyUserFormValues = z.infer<typeof updateCompanyUserSchema>;

export function roleFromChoice(choice: string): { role: Role; company_role_id: string | null } {
  if (choice.startsWith(CUSTOM_ROLE_PREFIX)) {
    return { role: Role.SUPPORT, company_role_id: choice.slice(CUSTOM_ROLE_PREFIX.length) };
  }
  return { role: choice as Role, company_role_id: null };
}

export function choiceFromUser(user: { role: string; company_role_id?: string | null }): string {
  return user.company_role_id ? `${CUSTOM_ROLE_PREFIX}${user.company_role_id}` : user.role;
}
