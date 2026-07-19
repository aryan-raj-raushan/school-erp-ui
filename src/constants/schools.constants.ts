export const BOARD_TYPES = ['CBSE', 'ICSE', 'IB', 'STATE', 'NIOS'] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

export const SCHOOLS_PAGE = {
  title: 'Schools',
  description: 'Manage all schools in the system',
  addButton: 'Add School',
  empty: 'No schools yet',
  table: {
    name: 'Name',
    code: 'Code',
    board: 'Board',
    city: 'City',
    status: 'Status',
    created: 'Created',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
} as const;

export const CREATE_SCHOOL_FORM = {
  title: 'Create School',
  sections: {
    basic: 'Basic Info',
    contact: 'Contact',
    location: 'Location',
    admin: 'School Admin Account',
  },
  labels: {
    name: 'School Name',
    code: 'School Code',
    board_type: 'Board Type',
    email: 'Email',
    dial_code: 'Dial Code',
    contact_number: 'Contact Number',
    website: 'Website',
    address: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    admin_first_name: 'First Name',
    admin_last_name: 'Last Name',
    admin_phone: 'Phone Number',
    admin_email: 'Email',
    admin_password: 'Initial Password',
  },
  placeholders: {
    name: 'Sunrise Academy',
    code: 'SUN001',
    email: 'admin@school.edu',
    dial_code: '+91',
    contact_number: '9876543210',
    website: 'https://school.edu',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    board_type: 'Select board type',
    admin_first_name: 'Ramesh',
    admin_last_name: 'Kumar',
    admin_phone: '9876543210',
    admin_email: 'admin@school.edu.in',
    admin_password: 'Admin@1234',
  },
  adminHint: 'Optional — set an initial password so the admin can log in immediately. They must change it on first login.',
  editAdminHint: 'Leave the password blank to keep it unchanged. Setting a new one forces the admin to change it on next login.',
  submit: {
    idle: 'Create School',
    loading: 'Creating…',
  },
  cancel: 'Cancel',
} as const;

