export const PLANS_PAGE = {
  title: 'Plan Catalog',
  description: 'Reusable billing plans that can be assigned to schools',
  addButton: 'Create Plan',
  empty: 'No plans yet',
  table: {
    name: 'Name',
    billingModel: 'Billing Model',
    price: 'Price',
    cycle: 'Cycle',
    status: 'Status',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
} as const;

export const CREATE_PLAN_FORM = {
  title: 'Create Plan',
  labels: {
    name: 'Plan Name',
    billing_model: 'Billing Model',
    flat_amount: 'Flat Amount (₹/month)',
    price_per_student: 'Price per Student (₹/month)',
    billing_cycle: 'Billing Cycle',
  },
  placeholders: {
    name: 'Standard Monthly',
    flat_amount: '5000',
    price_per_student: '10',
  },
  submit: { idle: 'Create', loading: 'Creating…' },
  cancel: 'Cancel',
} as const;
