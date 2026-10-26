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
  },
  placeholders: {
    name: 'Sunrise Academy',
    code: 'Auto-generated from the school name',
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
  },
  adminHint: 'A temporary password is generated automatically. The admin must change it after the first login.',
  editAdminHint: 'Use "Reset admin password" from the row menu to issue a new temporary password.',
  submit: {
    idle: 'Create School',
    loading: 'Creating…',
  },
  cancel: 'Cancel',
} as const;

