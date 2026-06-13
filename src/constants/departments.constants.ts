export const DEPARTMENTS_PAGE = {
  title: 'Departments',
  addButton: 'Add Department',
  empty: 'No departments found.',
  table: {
    name: 'Name',
    address: 'Address',
    description: 'Description',
    enabled: 'Enabled',
    actions: 'Actions',
  },
  form: {
    createTitle: 'Add Department',
    editTitle: 'Edit Department',
    name: 'Name *',
    address: 'Address',
    description: 'Description',
    isActive: 'Enabled',
    submit: 'Create Department',
    update: 'Save Changes',
    cancel: 'Cancel',
  },
  placeholders: {
    name: 'Enter Name',
    address: 'Enter Address',
    description: 'Enter Description',
  },
} as const;
