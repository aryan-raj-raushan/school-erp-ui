import type { BadgeVariant } from '@/components/ui/badge';
import type { LeaveRequestStatus } from '@/types';

export const LEAVE_STATUS_BADGE: Record<LeaveRequestStatus, BadgeVariant> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export const LEAVE_POLICY_PAGE = {
  title: 'Leave Policy',
  addButton: 'New Policy',
  empty: 'No leave policies yet. Create one to get started.',
  selectedEmpty: 'Select a policy to view details.',
  table: {
    leaveType: 'Leave Type',
    maxDays: 'Max Days',
    paid: 'Paid',
    actions: 'Actions',
  },
  form: {
    title: 'Create Leave Policy',
    policyName: 'Policy Name *',
    description: 'Description',
    leaveTypes: 'Leave Types',
    addType: 'Add Leave Type',
    typeName: 'Type Name *',
    maxDays: 'Max Days *',
    isPaid: 'Paid',
    typeDescription: 'Description',
    submit: 'Create Policy',
    cancel: 'Cancel',
  },
  provision: {
    title: 'Provision Leave Balances',
    desc: 'Provision leave balances for all staff under this policy for the selected academic year.',
    academicYear: 'Academic Year *',
    submit: 'Provision All Staff',
    cancel: 'Cancel',
  },
} as const;

export const LEAVE_PAGE = {
  title: 'Leave Management',
  applyButton: 'Apply for Leave',
  tabs: {
    teacher: 'Teacher Requests',
    student: 'Student Requests',
    myRequests: 'My Requests',
    myBalance: 'My Balance',
  },
  table: {
    staff: 'Staff',
    student: 'Student',
    type: 'Leave Type',
    from: 'From',
    to: 'To',
    days: 'Days',
    reason: 'Reason',
    status: 'Status',
    actions: 'Actions',
    balance: 'Leave Balance',
    used: 'Used',
    remaining: 'Remaining',
    total: 'Total',
  },
  empty: 'No leave requests.',
  balanceEmpty: 'No leave balances. Select an academic year.',
  review: {
    title: 'Review Leave Request',
    status: 'Decision *',
    remarks: 'Remarks (optional)',
    submit: 'Submit',
    cancel: 'Cancel',
    approve: 'Approve',
    reject: 'Reject',
  },
  apply: {
    title: 'Apply for Leave',
    leaveType: 'Leave Type *',
    fromDate: 'From Date *',
    toDate: 'To Date *',
    reason: 'Reason *',
    submit: 'Apply',
    cancel: 'Cancel',
  },
} as const;
