import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const schoolEventSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200),
    type: z.enum(['EVENT', 'HOLIDAY'], { message: 'Type is required' }),
    academic_year_id: z.string().min(1, 'Academic year is required'),
    description: z.string().optional().or(z.literal('')),
    from_date: z.string().min(1, 'From date is required'),
    from_time: z
      .string()
      .optional()
      .refine((v) => !v || TIME_REGEX.test(v), { message: 'Invalid time format (HH:mm)' }),
    to_date: z.string().min(1, 'To date is required'),
    to_time: z
      .string()
      .optional()
      .refine((v) => !v || TIME_REGEX.test(v), { message: 'Invalid time format (HH:mm)' }),
  })
  .refine((d) => d.to_date >= d.from_date, {
    message: 'To date must be on or after From date',
    path: ['to_date'],
  });

export type SchoolEventFormValues = z.infer<typeof schoolEventSchema>;