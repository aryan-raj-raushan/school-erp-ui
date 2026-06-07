import type { BadgeVariant } from '@/components/ui/badge';
import type { SubmissionStatus, HomeworkStatus, FeeStatus } from '@/types';

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

export const HOMEWORK_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

export const HOMEWORK_STATUS_BADGE: Record<HomeworkStatus, BadgeVariant> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  CLOSED: 'warning',
};

export const HOMEWORK_PAGE = {
  title: 'Homework',
  addButton: 'Assign Homework',
  table: {
    title: 'Title',
    subject: 'Subject',
    homeworkDate: 'Homework Date',
    dueDate: 'Due Date',
    status: 'Status',
    createdBy: 'Created By',
    actions: 'Actions',
  },
  empty: 'Select class to view homework.',
  form: {
    createTitle: 'Create Homework',
    editTitle: 'Edit Homework',
    session: 'Session',
    class: 'Class *',
    classDetail: 'Class (Year / Semester)',
    subject: 'Subject *',
    title: 'Title *',
    homeworkDate: 'Date of Homework',
    dueDate: 'Date of Submission *',
    status: 'Homework Status *',
    sendNotification: 'Send Notification',
    studentUploadAllowed: 'Student Upload Allowed',
    description: 'Homework Description',
    attachments: 'Homework File Attachment',
    attachmentsHint: 'jpg, png, pdf file accepted and Max 2MB each',
    submit: 'Create Homework',
    update: 'Save Changes',
    cancel: 'Cancel',
  },
  placeholders: {
    selectSession: 'Select Session',
    selectClass: 'Select Class',
    selectClassDetail: 'Select Year / Semester',
    selectSubject: 'Select Subject',
    selectStatus: 'Select Status',
    title: 'Enter Title',
    description: 'Type something',
  },
  attachmentTable: {
    fileName: 'File Name',
    status: 'Status',
    preview: 'Preview',
    view: 'Download / View',
    remove: 'Remove',
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
