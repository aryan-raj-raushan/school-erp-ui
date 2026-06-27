import { z } from 'zod';


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

export const studentHostelInfoSchema = z.object({
  hostel_required: z.boolean().optional(),
  hostel_name: z.string().max(150).optional(),
  room_number: z.string().max(20).optional(),
});

export const studentParentSchema = z.object({
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'GRANDPARENT', 'SIBLING', 'OTHER']),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  dial_code: z.string().optional(),
  phone_number: z.string().max(15).optional(),
  alternate_phone: z.string().max(15).optional(),
  occupation: z.string().max(100).optional(),
  qualification: z.enum([
    'BELOW_10TH', 'CLASS_10TH', 'CLASS_12TH', 'UNDERGRADUATE',
    'POSTGRADUATE', 'MASTERS', 'DOCTORATE', 'OTHER',
  ]).optional(),
  annual_income: z.string().max(50).optional(),
  aadhaar_number: z.string().max(12).optional(),
  is_primary: z.boolean().optional(),
  can_pickup: z.boolean().optional(),
}).superRefine((data, ctx) => {
  const hasData = data.first_name?.trim() || data.phone_number?.trim();
  if (hasData) {
    if (!data.first_name?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'First name is required', path: ['first_name'] });
    }
    if (!data.phone_number?.trim() || data.phone_number.length < 7) {
      ctx.addIssue({ code: 'custom', message: 'Valid phone number required (min 7 digits)', path: ['phone_number'] });
    }
  }
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
  // Basic Info
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().max(100).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  blood_group: z.enum([
    'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
    'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE',
  ]).optional(),
  religion: z.enum(['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'JAIN', 'BUDDHIST', 'OTHER']).optional(),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'OTHER']).optional(),
  caste: z.string().max(50).optional(),
  nationality: z.string().max(50).optional(),
  aadhaar_number: z.string().max(12).optional(),
  id_card_number: z.string().max(50).optional(),
  height_cm: z.string().optional(),
  weight_kg: z.string().optional(),
  profile_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  dial_code: z.string().optional(),
  phone_number: z.string().max(15).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED', 'DROPPED']).optional(),
  is_enabled: z.boolean().optional(),

  // Sub sections
  academic_info: studentAcademicInfoSchema.optional(),
  previous_academics: studentPreviousAcademicsSchema.optional(),
  address: studentAddressSchema.optional(),
  hostel_info: studentHostelInfoSchema.optional(),
  parents: z.array(studentParentSchema).optional(),
  documents: z.array(studentDocumentSchema).optional(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type StudentParentFormValues = z.infer<typeof studentParentSchema>;
export type StudentDocumentFormValues = z.infer<typeof studentDocumentSchema>;