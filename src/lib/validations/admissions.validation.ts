import { z } from 'zod';

export const admissionSourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  is_enabled: z.boolean().optional(),
});

export type AdmissionSourceFormValues = z.infer<typeof admissionSourceSchema>;

export const admissionEnquirySchema = z.object({
  // Academic year context
  academic_year_id: z.string().min(1, 'Academic year is required'),

  // Parent / Basic Info
  father_name: z.string().max(150).optional().or(z.literal('')),
  mother_name: z.string().max(150).optional().or(z.literal('')),
  phone: z.string().min(7, 'Valid phone required').regex(/^\d+$/, 'Numbers only'),
  dial_code: z.string().min(1, 'Dial code required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  father_occupation: z.string().max(100).optional().or(z.literal('')),
  mother_occupation: z.string().max(100).optional().or(z.literal('')),
  father_qualification: z.string().max(100).optional().or(z.literal('')),
  mother_qualification: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),

  // Student Info
  student_name: z.string().min(1, 'Student name is required').max(200),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  religion: z.enum(['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'JAIN', 'BUDDHIST', 'OTHER']).optional(),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'OTHER']).optional(),
  student_current_address: z.string().optional().or(z.literal('')),

  // Admission Info
  applying_academic_year_id: z.string().min(1, 'Applying academic year is required'),
  applying_class_id: z.string().min(1, 'Applying class is required'),
  previous_school_name: z.string().max(300).optional().or(z.literal('')),
  previous_class: z.string().max(100).optional().or(z.literal('')),
  registration_fee_required: z.boolean().optional(),

  // Enquiry Info
  assigned_teacher_id: z.string().optional().or(z.literal('')),
  next_followup_date: z.string().optional().or(z.literal('')),
  next_followup_time: z.string().optional().or(z.literal('')),
  enquiry_source_id: z.string().optional().or(z.literal('')),
  remarks: z.string().min(1, 'Remarks are required'),

  // Status (for update only)
  status: z.enum(['NEW', 'FOLLOW_UP', 'ADMISSION_CONFIRMED', 'REJECTED']).optional(),
});

export type AdmissionEnquiryFormValues = z.infer<typeof admissionEnquirySchema>;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const enquiryHistorySchema = z.object({
  action: z.enum([
    'NEW_ENQUIRY',
    'NEXT_FOLLOW_UP_UPDATE',
    'ADMISSION_CONFIRMED',
    'ENQUIRY_REJECTED',
    // 'REMARKS_UPDATED',
    // 'TEACHER_ASSIGNED',
  ], { message: 'Action is required' }),
  next_followup_date: z.string().optional().or(z.literal('')),
    next_followup_time: z
      .string()
      .optional()
      .refine((v) => !v || TIME_REGEX.test(v), { message: 'Invalid time (HH:mm)' }),
  details: z.string().optional().or(z.literal('')),
  remarks: z.string().min(1, 'Remarks are required'),
});

export type EnquiryHistoryFormValues = z.infer<typeof enquiryHistorySchema>;