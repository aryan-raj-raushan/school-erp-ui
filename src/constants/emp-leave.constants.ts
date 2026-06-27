import type { LeaveValidity, LeavePayType, LeaveApplicationStatus } from '@/types/leave.types';

// ─── Leave Type Page ──────────────────────────────────────────────────────────
export const LEAVE_TYPE_PAGE = {
  pageHeading: {
    title: 'Leave Types',
    subtitle: '',
  },
  buttons: {
    addLeaveType: 'Add Leave Type',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    createLeaveType: 'Create Leave Type',
    saveChanges: 'Save Changes',
  },
  table: {
    sno: 'S. No.',
    leaveName: 'Leave Name',
    validity: 'Validity',
    payType: 'Pay Type',
    days: 'Days Allowed',
    status: 'Status',
    actions: 'Actions',
    noEntry: 'No leave types found',
  },
  labels: {
    leaveName: 'Leave Name',
    leaveValidity: 'Leave Validity',
    leavePayType: 'Leave Pay Type',
    leaveCountDays: 'Leave Count (Days)',
    isEnabled: 'Is Enabled',
  },
  placeholders: {
    leaveName: 'e.g. Casual Leave',
    leaveCountDays: 'e.g. 12',
  },
  sections: {
    basicInfo: 'Leave Type Details',
  },
  toasts: {
    createSuccess: 'Leave type created successfully',
    updateSuccess: 'Leave type updated successfully',
    deleteSuccess: 'Leave type deleted',
    deleteError: 'Failed to delete leave type',
    fetchError: 'Failed to load leave type data',
  },
} as const;

// ─── Leave Assigned Page ──────────────────────────────────────────────────────
// export const LEAVE_ASSIGNED_PAGE = {
//   pageHeading: {
//     title: 'Employee Leave Assignments',
//     subtitle: '',
//   },
//   buttons: {
//     assignLeave: 'Assign Leave',
//     revoke: 'Revoke',
//     cancel: 'Cancel',
//     save: 'Assign',
//     back: 'Back',
//   },
//   table: {
//     sno: 'S. No.',
//     leaveName: 'Leave Name',
//     validity: 'Validity',
//     payType: 'Pay Type',
//     totalDays: 'Total Days',
//     usedDays: 'Used Days',
//     remainingDays: 'Remaining Days',
//     academicYear: 'Academic Year',
//     actions: 'Actions',
//     noEntry: 'No leaves assigned to this employee',
//   },
//   labels: {
//     leaveType: 'Leave Type',
//     academicYear: 'Academic Year',
//     employee: 'Employee',
//   },
//   modal: {
//     title: 'Assign Leave to Employee',
//   },
//   filters: {
//     allYears: 'All Academic Years',
//   },
//   toasts: {
//     assignSuccess: 'Leave assigned successfully',
//     assignError: 'Failed to assign leave',
//     revokeSuccess: 'Leave assignment revoked',
//     revokeError: 'Failed to revoke leave assignment',
//     fetchError: 'Failed to load assigned leaves',
//   },
// } as const;

export const LEAVE_ASSIGNED_PAGE = {
  pageHeading: {
    title: 'Employee Leave Assignments',
    subtitle: 'Select an employee to view or manage their leave assignments',
    assignmentsSuffix: 'assignments',
  },
  buttons: {
    assignLeave: 'Assign Leave',
    revoke: 'Revoke',
    cancel: 'Cancel',
    save: 'Assign',
    back: 'All Employees',
  },
  table: {
    sno: 'S. No.',
    leaveName: 'Leave Name',
    validity: 'Validity',
    payType: 'Pay Type',
    totalDays: 'Total Days',
    usedDays: 'Used Days',
    remainingDays: 'Remaining Days',
    academicYear: 'Academic Year',
    actions: 'Actions',
    noEntry: 'No leaves assigned to this employee',
  },
  labels: {
    leaveType: 'Leave Type',
    academicYear: 'Academic Year',
    employee: 'Employee',
  },
  modal: {
    title: 'Assign Leave to Employee',
  },
  filters: {
    allYears: 'All Academic Years',
    searchEmployee: 'Search by name, email…',
  },
  empty: {
    noEmployees: 'No employees found',
  },
  toasts: {
    assignSuccess: 'Leave assigned successfully',
    assignError: 'Failed to assign leave',
    revokeSuccess: 'Leave assignment revoked',
    revokeError: 'Failed to revoke leave assignment',
    fetchError: 'Failed to load assigned leaves',
  },
} as const;

// ─── Leave Application Page ───────────────────────────────────────────────────
export const LEAVE_APPLICATION_PAGE = {
  pageHeading: {
    title: 'Leave Applications',
    subtitle: '',
  },
  buttons: {
    applyLeave: 'Apply Leave',
    approve: 'Approve',
    reject: 'Reject',
    cancel: 'Cancel',
    save: 'Submit Application',
    back: 'Back',
    cancelApplication: 'Cancel Application',
    review: 'Review',
  },
  table: {
    sno: 'S. No.',
    employee: 'Employee',
    leaveType: 'Leave Type',
    startDate: 'Start Date',
    endDate: 'End Date',
    totalDays: 'Days',
    reason: 'Reason',
    status: 'Status',
    appliedOn: 'Applied On',
    reviewedBy: 'Reviewed By',
    remarks: 'Remarks',
    actions: 'Actions',
    noEntry: 'No leave applications found',
  },
  labels: {
    leaveType: 'Leave Type',
    academicYear: 'Academic Year',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason (Optional)',
    status: 'Review Decision',
    remarks: 'Remarks (Optional)',
    employee: 'Employee',
  },
  placeholders: {
    reason: 'Brief reason for leave…',
    remarks: 'Add remarks for this decision…',
    search: 'Search by employee name…',
  },
  filters: {
    allStatus: 'All Status',
    allYears: 'All Academic Years',
    allLeaveTypes: 'All Leave Types',
  },
  modal: {
    applyTitle: 'Apply for Leave',
    reviewTitle: 'Review Leave Application',
  },
  toasts: {
    applySuccess: 'Leave application submitted successfully',
    applyError: 'Failed to submit leave application',
    approveSuccess: 'Leave application approved',
    rejectSuccess: 'Leave application rejected',
    reviewError: 'Failed to review leave application',
    cancelSuccess: 'Leave application cancelled',
    cancelError: 'Failed to cancel leave application',
    fetchError: 'Failed to load leave applications',
  },
} as const;

// ─── Leave Apply Page ───────────────────────────────────────────────────

export const LEAVE_APPLY_PAGE = {
  pageHeading: {
    title: 'Apply Leave',
    subtitle: 'Apply leave for yourself or on behalf of an employee',
  },
  sections: {
    selectEmployee: 'Select Employee',
    leaveDetails: 'Leave Details',
    summary: 'Summary',
  },
  labels: {
    applyFor: 'Applying For',
    myself: 'Myself',
    onBehalf: 'On Behalf of Employee',
    employee: 'Select Employee',
    academicYear: 'Academic Year',
    leaveType: 'Leave Type',
    startDate: 'Start Date',
    endDate: 'End Date',
    totalDays: 'Total Days',
    reason: 'Reason (Optional)',
    balance: 'Available Balance',
    used: 'Used',
    remaining: 'Remaining',
    payType: 'Pay Type',
  },
  placeholders: {
    searchEmployee: 'Search employee by name…',
    reason: 'Brief reason for leave (optional)…',
    selectLeaveType: 'Select leave type',
    selectYear: 'Select academic year',
  },
  buttons: {
    submit: 'Submit Application',
    submitting: 'Submitting…',
    reset: 'Reset Form',
    selectEmployee: 'Select',
    changeEmployee: 'Change',
  },
  info: {
    noAssignedLeaves: 'No leave types are assigned to this employee for the selected academic year.',
    selectYearFirst: 'Select an academic year to see available leave types.',
    selectEmployeeFirst: 'Select an employee to continue.',
    daysCalculation: 'Days are calculated inclusively (start and end date both count).',
  },
  toasts: {
    submitSuccess: 'Leave application submitted successfully',
    submitError: 'Failed to submit leave application',
    fetchEmployeeLeavesError: 'Failed to fetch leave balance for this employee',
  },
  table: {
    recentTitle: 'Recent Applications',
    leaveType: 'Leave Type',
    period: 'Period',
    days: 'Days',
    status: 'Status',
    appliedOn: 'Applied On',
    noRecent: 'No recent applications',
  },
} as const;

// ─── Shared option arrays ─────────────────────────────────────────────────────
export const LEAVE_VALIDITY_OPTIONS: { value: LeaveValidity | ''; label: string }[] = [
  { value: '', label: 'All Validity' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'ON_OCCASION', label: 'On Occasion' },
];

export const LEAVE_PAY_TYPE_OPTIONS: { value: LeavePayType | ''; label: string }[] = [
  { value: '', label: 'All Pay Types' },
  { value: 'PAID', label: 'Paid' },
  { value: 'UNPAID', label: 'Unpaid' },
];

export const LEAVE_STATUS_OPTIONS: { value: LeaveApplicationStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const LEAVE_STATUS_BADGE: Record<
  LeaveApplicationStatus,
  'default' | 'success' | 'destructive' | 'warning' | 'secondary'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
};

export const LEAVE_VALIDITY_LABEL: Record<LeaveValidity, string> = {
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  ON_OCCASION: 'On Occasion',
};

export const LEAVE_PAY_TYPE_LABEL: Record<LeavePayType, string> = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
};