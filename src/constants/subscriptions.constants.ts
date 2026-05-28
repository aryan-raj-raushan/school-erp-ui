import type { BadgeVariant } from '@/components/ui/badge';
import type { SubscriptionStatus } from '@/types';

export const SUBSCRIPTION_STATUS_BADGE: Record<SubscriptionStatus, BadgeVariant> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  CANCELLED: 'danger',
  EXPIRED: 'danger',
  INACTIVE: 'default',
};

export const PLAN_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'LIFETIME', label: 'Lifetime' },
  { value: 'TRIAL', label: 'Trial' },
] as const;

export const SUBSCRIPTIONS_PAGE = {
  title: 'Subscriptions',
  description: 'Manage school subscriptions and billing',
  addButton: 'Add Subscription',
  table: {
    school: 'School',
    plan: 'Plan',
    type: 'Type',
    amount: 'Amount',
    status: 'Status',
    startDate: 'Start Date',
    endDate: 'End Date',
  },
  empty: 'No subscriptions yet',
  form: {
    title: 'Create Subscription',
    school: 'School *',
    planName: 'Plan Name *',
    planType: 'Plan Type *',
    amount: 'Amount (₹) *',
    maxStudents: 'Max Students',
    startDate: 'Start Date',
    endDate: 'End Date',
    submit: 'Create',
    cancel: 'Cancel',
  },
  placeholders: {
    planName: 'Monthly Plan',
    amount: '999',
    maxStudents: '500',
    selectSchool: 'Select school',
  },
} as const;
