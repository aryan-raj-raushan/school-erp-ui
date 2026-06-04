import type { BadgeVariant } from '@/components/ui/badge';
import type { StaffStatus } from '@/types';

export const STAFF_STATUS_BADGE: Record<StaffStatus, BadgeVariant> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  OFFBOARDED: 'danger',
};

export const STAFF_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'OFFBOARDED', label: 'Offboarded' },
] as const;

// Matches backend SchoolRole enum exactly
export const STAFF_ROLE_OPTIONS = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'CLASS_TEACHER', label: 'Class Teacher' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'VICE_PRINCIPAL', label: 'Vice Principal' },
  { value: 'SCHOOL_ADMIN', label: 'Admin' },
] as const;

export const STAFF_PAGE = {
  title: 'Staff',
  addButton: 'Add Staff',
  bulkImport: 'Bulk Import',
  downloadTemplate: 'Download Template',
  table: {
    name: 'Name',
    role: 'Role',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    actions: 'Actions',
  },
  empty: 'No staff members found.',
  form: {
    title: 'Add Staff Member',
    firstName: 'First Name *',
    lastName: 'Last Name',
    dialCode: 'Dial Code *',
    phone: 'Phone *',
    email: 'Email',
    role: 'Role *',
    gender: 'Gender',
    dateOfBirth: 'Date of Birth',
    submit: 'Add Staff',
    cancel: 'Cancel',
  },
  editForm: {
    title: 'Edit Staff Member',
    submit: 'Save Changes',
    cancel: 'Cancel',
  },
  bulkImportForm: {
    title: 'Bulk Import Staff',
    file: 'Excel File *',
    submit: 'Import',
    cancel: 'Cancel',
  },
  placeholders: {
    firstName: 'Ravi',
    lastName: 'Sharma',
    email: 'staff@school.edu',
    dialCode: '+91',
    phone: '9876543210',
  },
  offboardForm: {
    title: 'Offboard Staff Member',
    reason: 'Reason',
    offboardDate: 'Offboard Date',
    submit: 'Offboard',
    cancel: 'Cancel',
  },
} as const;
