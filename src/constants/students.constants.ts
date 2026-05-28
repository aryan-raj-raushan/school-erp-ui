import type { BadgeVariant } from '@/components/ui/badge';
import type { StudentStatus } from '@/types';

export const STUDENT_STATUS_BADGE: Record<StudentStatus, BadgeVariant> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  TRANSFERRED: 'info',
  GRADUATED: 'info',
  DROPPED: 'danger',
};

export const STUDENT_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'DROPPED', label: 'Dropped' },
] as const;

export const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const BLOOD_GROUP_OPTIONS = [
  { value: '', label: 'Select blood group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
] as const;

export const PARENT_RELATION_OPTIONS = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'GUARDIAN', label: 'Guardian' },
  { value: 'GRANDPARENT', label: 'Grandparent' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const STUDENTS_PAGE = {
  title: 'Students',
  addButton: 'Add Student',
  table: {
    name: 'Name',
    admissionNo: 'Admission No.',
    class: 'Class',
    section: 'Section',
    gender: 'Gender',
    status: 'Status',
  },
  empty: 'No students found.',
  form: {
    firstName: 'First Name *',
    lastName: 'Last Name',
    admissionNumber: 'Admission Number *',
    academicYear: 'Academic Year *',
    class: 'Class *',
    section: 'Section',
    rollNumber: 'Roll Number',
    gender: 'Gender',
    dateOfBirth: 'Date of Birth',
    admissionDate: 'Admission Date',
    email: 'Email',
    dialCode: 'Dial Code',
    phone: 'Phone',
    submit: 'Add Student',
    cancel: 'Cancel',
    title: 'Add Student',
  },
  placeholders: {
    firstName: 'John',
    lastName: 'Doe',
    admissionNumber: '2024001',
    rollNumber: '01',
    email: 'student@school.edu',
    dialCode: '+91',
    phone: '9876543210',
  },
} as const;

export const STUDENT_DETAIL_PAGE = {
  back: 'Back',
  sections: {
    personal: 'Personal Info',
    academic: 'Academic Info',
    contact: 'Contact Info',
    parents: 'Parents / Guardians',
  },
  labels: {
    fullName: 'Full Name',
    gender: 'Gender',
    dob: 'Date of Birth',
    bloodGroup: 'Blood Group',
    nationality: 'Nationality',
    aadhaar: 'Aadhaar',
    academicYear: 'Academic Year',
    class: 'Class',
    section: 'Section',
    rollNumber: 'Roll Number',
    admissionDate: 'Admission Date',
    email: 'Email',
    phone: 'Phone',
  },
  table: {
    name: 'Name',
    relation: 'Relation',
    phone: 'Phone',
    email: 'Email',
    primary: 'Primary',
    canPickup: 'Can Pickup',
    actions: 'Actions',
  },
  addParent: 'Add Parent',
  removeParent: 'Remove',
  empty: 'No parents/guardians added.',
  parentForm: {
    title: 'Add Parent / Guardian',
    firstName: 'First Name *',
    lastName: 'Last Name',
    relation: 'Relation *',
    occupation: 'Occupation',
    dialCode: 'Dial Code *',
    phone: 'Phone *',
    email: 'Email',
    isPrimary: 'Primary contact',
    canPickup: 'Can pickup student',
    submit: 'Add Parent',
    cancel: 'Cancel',
  },
  placeholders: {
    firstName: 'Ramesh',
    lastName: 'Kumar',
    occupation: 'Engineer',
    dialCode: '+91',
    phone: '9876543210',
    email: 'parent@example.com',
  },
} as const;
