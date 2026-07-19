export const TEAM_PAGE = {
  title: 'Team',
  description: 'Manage Sales, Operator, Support and Admin staff logins',
  addButton: 'Add Team Member',
  empty: 'No team members yet',
  table: {
    name: 'Name',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    lastLogin: 'Last Login',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
  roleLabels: {
    ADMIN: 'Admin',
    SUPPORT: 'Support',
    SALES: 'Sales Executive',
    OPERATOR: 'Operator',
  },
  schoolsModal: {
    title: 'Assigned Schools',
    hint: 'Sales Executives and Operators only see schools assigned to them here.',
    assign: 'Assign School',
    empty: 'No schools assigned yet',
    remove: 'Remove',
  },
} as const;

export const CREATE_TEAM_MEMBER_FORM = {
  title: 'Add Team Member',
  labels: {
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email',
    password: 'Password',
    role: 'Role',
  },
  placeholders: {
    first_name: 'Ramesh',
    last_name: 'Kumar',
    email: 'ramesh@company.com',
    password: 'Passw0rd!',
  },
  submit: {
    idle: 'Create',
    loading: 'Creating…',
  },
  cancel: 'Cancel',
} as const;
