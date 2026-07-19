import type { BadgeVariant } from '@/components/ui/badge';
import type { SubscriptionStatus } from '@/types';

export const SUBSCRIPTION_STATUS_BADGE: Record<SubscriptionStatus, BadgeVariant> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  TRIAL: 'warning',
  CANCELLED: 'danger',
  EXPIRED: 'danger',
};

export const PLAN_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-Yearly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'CUSTOM', label: 'Custom' },
] as const;

export const BILLING_MODEL_OPTIONS = [
  { value: 'FLAT', label: 'Flat Monthly Price' },
  { value: 'PER_STUDENT', label: 'Per Student' },
] as const;

export const RESTRICTION_MODE_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'SOFT', label: 'Soft — block selected modules' },
  { value: 'PARTIAL', label: 'Partial — block create/update/delete' },
  { value: 'COMPLETE', label: 'Complete suspension' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'QR_CODE', label: 'QR Code' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'RAZORPAY', label: 'Razorpay' },
] as const;

export const SUBSCRIPTIONS_PAGE = {
  title: 'Subscriptions',
  description: 'Assign billing plans and postpaid policy to schools',
  addButton: 'Assign Subscription',
  table: {
    school: 'School',
    plan: 'Plan',
    type: 'Cycle',
    amount: 'Amount',
    status: 'Status',
    startDate: 'Start Date',
    endDate: 'End Date',
    actions: 'Actions',
  },
  empty: 'No subscriptions yet',
  cancelAction: 'Cancel',
  cancelPrompt: 'Reason for cancellation (optional)',
  cancelSubmit: 'Confirm Cancel',
  cancelDismiss: 'Dismiss',
  form: {
    title: 'Assign Subscription',
    school: 'School *',
    sections: {
      plan: 'Plan',
      custom: 'Custom Plan',
      policy: 'Billing Policy',
    },
    existingPlan: 'Use existing plan',
    customPlanHint: 'No plan selected — define pricing inline for this school only.',
    planName: 'Plan Name *',
    planType: 'Billing Cycle *',
    billingModel: 'Billing Model *',
    amount: 'Flat Amount (₹) *',
    pricePerStudent: 'Price per Student (₹) *',
    maxStudents: 'Max Students',
    startDate: 'Start Date',
    endDate: 'End Date',
    autoRenew: 'Auto-Renew',
    autoRenewHint: 'When End Date is reached, automatically extend it by one billing cycle instead of expiring — until manually cancelled.',
    gracePeriod: 'Grace Period (days)',
    restrictionMode: 'Restriction Mode',
    restrictedResources: 'Restricted Modules (Soft mode only)',
    paymentMethods: 'Allowed Payment Methods',
    submit: 'Assign',
    cancel: 'Cancel',
  },
  placeholders: {
    planName: 'Monthly Plan',
    amount: '999',
    pricePerStudent: '10',
    maxStudents: '500',
    selectSchool: 'Select school',
    selectPlan: 'Select a plan (or leave blank for custom)',
    gracePeriod: '0',
  },
} as const;
