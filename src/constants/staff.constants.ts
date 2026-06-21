import type { BadgeVariant } from '@/components/ui/badge';
import type { StaffStatus } from '@/types';

export const BLOOD_GROUP_LABEL: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-', B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-', O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
};

export const GENDER_LABEL: Record<string, string> = {
  MALE: 'Male', FEMALE: 'Female', OTHER: 'Other',
};


export const BLOOD_GROUPS = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
] as const;

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
