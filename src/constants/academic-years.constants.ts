export const ACADEMIC_YEARS_PAGE = {
  title: 'Academic Years',
  description: 'Manage school academic years',
  addButton: 'Add Academic Year',
  table: {
    name: 'Name',
    startDate: 'Start Date',
    endDate: 'End Date',
    status: 'Status',
    actions: 'Actions',
  },
  empty: 'No academic years yet. Create one to get started.',
  setCurrentButton: 'Set Current',
  status: {
    current: 'Current',
    inactive: 'Inactive',
  },
  form: {
    title: 'Create Academic Year',
    name: 'Name *',
    startDate: 'Start Date *',
    endDate: 'End Date *',
    isCurrent: 'Set as current academic year',
    submit: 'Create',
    cancel: 'Cancel',
  },
  placeholders: {
    name: '2025-26',
  },
} as const;
