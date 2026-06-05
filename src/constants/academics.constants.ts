import type { BadgeVariant } from '@/components/ui/badge';
import type { SubmissionStatus, FeeStatus } from '@/types';

export const SUBMISSION_STATUS_BADGE: Record<SubmissionStatus, BadgeVariant> = {
  PENDING: 'default',
  SUBMITTED: 'info',
  GRADED: 'success',
  LATE: 'warning',
};

export const SUBMISSION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'GRADED', label: 'Graded' },
  { value: 'LATE', label: 'Late' },
] as const;

export const FEE_STATUS_BADGE: Record<FeeStatus, BadgeVariant> = {
  PENDING: 'warning',
  PARTIAL: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  WAIVED: 'default',
};

export const PAYMENT_MODE_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'NEFT', label: 'NEFT' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'DD', label: 'Demand Draft' },
] as const;

export const HOMEWORK_PAGE = {
  title: 'Homework',
  addButton: 'Assign Homework',
  table: {
    title: 'Title',
    subject: 'Subject',
    section: 'Section',
    dueDate: 'Due Date',
    submissions: 'Submissions',
    createdBy: "Created By",
    actions: 'Actions',
  },
  empty: 'No homework assigned. Select a section and subject to view.',
  form: {
    title: 'Assign Homework',
    editTitle: 'Edit Homework',
    hwTitle: 'Title *',
    description: 'Description',
    dueDate: 'Due Date *',
    attachmentUrl: 'Attachment URL',
    submit: 'Assign',
    save: 'Save Changes',
    cancel: 'Cancel',
  },
  submissions: {
    title: 'Submissions',
    table: {
      student: 'Student',
      status: 'Status',
      remarks: 'Remarks',
    },
    empty: 'No submissions yet.',
    save: 'Save All',
  },
} as const;

export const MATERIALS_PAGE = {
  title: 'Study Materials',
  addButton: 'Upload Material',
  table: {
    title: 'Title',
    subject: 'Subject',
    fileType: 'Type',
    uploadedBy: 'Uploaded',
    actions: 'Actions',
  },
  empty: 'No materials uploaded.',
  form: {
    title: 'Upload Study Material',
    editTitle: 'Edit Material',
    matTitle: 'Title *',
    description: 'Description',
    fileUrl: 'File URL *',
    fileType: 'File Type',
    upload: 'Upload File',
    submit: 'Save',
    cancel: 'Cancel',
  },
} as const;

export const FEE_TYPES_PAGE = {
  title: 'Fee Types',
  addButton: 'Add Fee Type',
  table: {
    name: 'Name',
    description: 'Description',
    actions: 'Actions',
  },
  empty: 'No fee types defined.',
  form: {
    title: 'Add Fee Type',
    editTitle: 'Edit Fee Type',
    name: 'Name *',
    description: 'Description',
    submit: 'Add',
    save: 'Save',
    cancel: 'Cancel',
  },
} as const;

export const FEE_GENERATE_PAGE = {
  title: 'Generate Fee',
  generateButton: 'Generate',
  table: {
    student: 'Student',
    admNo: 'Adm No',
    total: 'Total',
    status: 'Status',
    dueDate: 'Due Date',
    actions: 'Actions',
  },
  empty: 'Select a section and academic year to generate fees.',
  noRecords: 'No fee records found.',
  form: {
    title: 'Generate Fee',
    student: 'Student *',
    feeItems: 'Fee Items',
    addItem: 'Add Item',
    feeType: 'Fee Type *',
    amount: 'Amount *',
    discount: 'Discount',
    dueDate: 'Due Date',
    notes: 'Notes',
    submit: 'Generate',
    cancel: 'Cancel',
  },
  payment: {
    title: 'Record Payment',
    amount: 'Amount *',
    mode: 'Payment Mode *',
    transactionId: 'Transaction ID',
    notes: 'Notes',
    submit: 'Record Payment',
    cancel: 'Cancel',
  },
} as const;

export const FEE_RECEIPTS_PAGE = {
  title: 'Fee Receipts',
  table: {
    receipt: 'Receipt No',
    student: 'Student',
    total: 'Total',
    paid: 'Paid',
    balance: 'Balance',
    status: 'Status',
    dueDate: 'Due Date',
    actions: 'Actions',
  },
  empty: 'No receipts found.',
} as const;
