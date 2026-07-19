import { z } from 'zod';
import {
  requiredNameSchema,
  optionalNameSchema,
  indianPhoneSchema,
  optionalIndianPhoneSchema,
  dialCodeSchema,
  optionalDialCodeSchema,
  optionalEmailSchema,
  optionalAadhaarSchema,
} from './common.validation';

export const studentAcademicInfoSchema = z.object({
  academic_year_id: z.string().min(1, 'Academic year is required'),
  class_id: z.string().min(1, 'Class is required'),
  section_id: z.string().optional(),
  admission_number: z.string().min(1, 'Admission number is required').max(50),
  registration_number: z.string().max(50).optional(),
  roll_number: z.string().max(20).optional(),
  joining_date: z.string().optional(),
});

export const studentPreviousAcademicsSchema = z.object({
  previous_school_name: z.string().max(300).optional(),
  previous_class: z.string().max(100).optional(),
  passing_year: z.string().max(10).optional(),
  total_marks: z.string().max(20).optional(),
  grade: z.string().max(10).optional(),
  board: z.string().max(50).optional(),
  tc_number: z.string().max(50).optional(),
});

export const studentAddressSchema = z.object({
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  country: z.string().max(100).optional(),
});

export const studentHostelInfoSchema = z
  .object({
    hostel_required: z.boolean().optional(),
    hostel_name: z.string().max(150).optional(),
    room_number: z.string().max(20).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hostel_required && !data.hostel_name?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Hostel name is required', path: ['hostel_name'] });
    }
  });

export const studentParentSchema = z.object({
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'GRANDPARENT', 'SIBLING', 'OTHER'], {
    message: 'Relation is required',
  }),
  first_name: requiredNameSchema(100),
  last_name: optionalNameSchema(100),
  email: optionalEmailSchema,
  dial_code: dialCodeSchema,
  phone_number: indianPhoneSchema,
  alternate_phone: optionalIndianPhoneSchema,
  occupation: z.string().max(100).optional(),
  qualification: z.enum([
    'BELOW_10TH', 'CLASS_10TH', 'CLASS_12TH', 'UNDERGRADUATE',
    'POSTGRADUATE', 'MASTERS', 'DOCTORATE', 'OTHER',
  ]).optional().or(z.literal('')),
  annual_income: z.string().max(50).optional(),
  aadhaar_number: optionalAadhaarSchema,
  is_primary: z.boolean().optional(),
  can_pickup: z.boolean().optional(),
});

export const studentDocumentSchema = z.object({
  document_name: z.enum([
    'BIRTH_CERTIFICATE', 'TRANSFER_CERTIFICATE', 'AADHAAR', 'PHOTO',
    'MEDICAL_CERTIFICATE', 'CASTE_CERTIFICATE', 'INCOME_CERTIFICATE',
    'PREVIOUS_MARKSHEET', 'MERIT_CERTIFICATE', 'REPORT', 'OTHER',
  ]),
  file_type: z.enum(['PDF', 'IMAGE']),
  document_link: z.string().min(1, 'Document link is required'),
  original_filename: z.string().optional(),
  remarks: z.string().max(300).optional(),
});

// ─── Main Form Schema ──────────────────────────────────────────────────────────

export const studentFormSchema = z.object({
  // Onboarding link — set when this student is created from a confirmed admission enquiry
  admission_enquiry_id: z.string().optional(),

  // Basic Info
  first_name: requiredNameSchema(100),
  last_name: optionalNameSchema(100),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender is required' }),
  blood_group: z.enum([
    'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
    'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE',
  ]).optional().or(z.literal('')),
  religion: z.enum(['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'JAIN', 'BUDDHIST', 'OTHER']).optional().or(z.literal('')),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'OTHER']).optional().or(z.literal('')),
  caste: z.string().max(50).optional(),
  nationality: z.string().max(50).optional(),
  aadhaar_number: optionalAadhaarSchema,
  id_card_number: z.string().max(50).optional(),
  height_cm: z.string().optional(),
  weight_kg: z.string().optional(),
  profile_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  dial_code: optionalDialCodeSchema,
  phone_number: optionalIndianPhoneSchema,
  email: optionalEmailSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED', 'DROPPED']).optional(),
  is_enabled: z.boolean().optional(),

  // Sub sections
  academic_info: studentAcademicInfoSchema,
  previous_academics: studentPreviousAcademicsSchema.optional(),
  address: studentAddressSchema.optional(),
  hostel_info: studentHostelInfoSchema.optional(),
  parents: z.array(studentParentSchema),
  documents: z.array(studentDocumentSchema).optional(),
}).superRefine((data, ctx) => {
  if (!data.parents || data.parents.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'At least one parent/guardian is required',
      path: ['parents'],
    });
  }
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type StudentParentFormValues = z.infer<typeof studentParentSchema>;
export type StudentDocumentFormValues = z.infer<typeof studentDocumentSchema>;
