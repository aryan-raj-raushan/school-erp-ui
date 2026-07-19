import type { BadgeVariant } from '@/components/ui/badge';
import type { InvoiceStatus } from '@/types';

export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, BadgeVariant> = {
  DRAFT: 'default',
  ISSUED: 'warning',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  VOID: 'default',
};

export const ONE_TIME_CHARGE_TYPE_OPTIONS = [
  { value: 'RFID_DEVICE', label: 'RFID Device' },
  { value: 'RFID_INSTALLATION', label: 'RFID Installation' },
  { value: 'SETUP', label: 'Setup Charge' },
  { value: 'TRAINING', label: 'Training Charge' },
  { value: 'SUPPORT', label: 'Support Charge' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const INVOICES_PAGE = {
  title: 'Invoices',
  description: 'View and pay your school’s invoices',
  empty: 'No invoices yet',
  table: {
    number: 'Invoice #',
    period: 'Billing Period',
    total: 'Total',
    paid: 'Paid',
    status: 'Status',
    dueDate: 'Due Date',
  },
  detail: {
    title: 'Invoice',
    lineItems: 'Line Items',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    total: 'Total',
    amountPaid: 'Amount Paid',
    balanceDue: 'Balance Due',
    downloadPdf: 'Download PDF',
    close: 'Close',
    payNow: 'Pay Now',
  },
  payForm: {
    title: 'Pay Invoice',
    method: 'Payment Method',
    amount: 'Amount (₹)',
    proof: 'Payment Proof (screenshot/receipt)',
    proofHint: 'Required for QR Code and Bank Transfer',
    notes: 'Notes (optional)',
    submit: 'Submit Payment',
    payWithRazorpay: 'Pay with Razorpay',
    cancel: 'Cancel',
  },
} as const;

export const PAYMENT_METHOD_FORM_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'QR_CODE', label: 'QR Code' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'RAZORPAY', label: 'Razorpay (Online)' },
] as const;

export const PENDING_PAYMENTS_SECTION = {
  title: 'Pending Payments',
  empty: 'No payments awaiting verification',
  table: {
    school: 'School',
    method: 'Method',
    amount: 'Amount',
    proof: 'Proof',
    submitted: 'Submitted',
  },
  viewProof: 'View Proof',
  approve: 'Approve',
  reject: 'Reject',
  rejectPrompt: 'Reason for rejection',
  rejectSubmit: 'Confirm Reject',
  rejectCancel: 'Cancel',
} as const;

export const INVOICE_PAYMENT_STATUS_BADGE: Record<string, BadgeVariant> = {
  PENDING: 'default',
  PENDING_VERIFICATION: 'warning',
  SUCCESS: 'success',
  FAILED: 'danger',
  REFUNDED: 'default',
  PARTIALLY_REFUNDED: 'default',
};

export const BILLING_PAGE = {
  title: 'Billing',
  description: 'Company-wide invoices, generation and one-time charges',
  generateInvoice: 'Generate Invoice',
  addCharge: 'Add One-Time Charge',
  table: {
    number: 'Invoice #',
    school: 'School',
    total: 'Total',
    paid: 'Paid',
    status: 'Status',
    dueDate: 'Due Date',
  },
  empty: 'No invoices yet',
  generateForm: {
    title: 'Generate Invoice',
    subscription: 'Subscription *',
    dueDate: 'Due Date (optional)',
    notes: 'Notes (optional)',
    extraItems: 'Extra Items (optional)',
    addItem: 'Add Item',
    itemDescription: 'Description',
    itemAmount: 'Amount (₹)',
    itemQuantity: 'Qty',
    remove: 'Remove',
    submit: 'Generate',
    cancel: 'Cancel',
  },
  chargeForm: {
    title: 'Add One-Time Charge',
    school: 'School *',
    chargeType: 'Charge Type *',
    description: 'Description',
    amount: 'Amount (₹) *',
    quantity: 'Quantity',
    targetInvoice: 'Add to Existing Invoice (optional)',
    targetInvoiceHint: 'Leave blank to generate a new invoice for this charge immediately',
    targetInvoicePlaceholder: 'None — generate a new invoice',
    submit: 'Add & Invoice',
    submitToExisting: 'Add to Invoice',
    cancel: 'Cancel',
  },
  detail: {
    title: 'Invoice',
    lineItems: 'Line Items',
    total: 'Total',
    amountPaid: 'Amount Paid',
    balanceDue: 'Balance Due',
    close: 'Close',
    addItem: 'Add Item to Invoice',
    addItemSubmit: 'Add',
    finalNotice: 'This invoice is fully paid or void — no further items can be added.',
  },
} as const;
