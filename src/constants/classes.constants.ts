export const CLASSES_VIEW_TABS = [
  { value: 'classes' as const, label: 'Classes' },
  { value: 'sections' as const, label: 'Sections' },
];

export type ClassesViewTab = (typeof CLASSES_VIEW_TABS)[number]['value'];

export const CLASSES_PAGE = {
  title: 'Classes & Sections',
  addClassButton: 'Add Class',
  addSectionButton: 'Add Section',
  classTable: {
    name: 'Name',
    academicYear: 'Academic Year',
    order: 'Order',
    sections: 'Sections',
    actions: 'Actions',
  },
  sectionTable: {
    section: 'Section',
    class: 'Class',
    room: 'Room',
    maxStrength: 'Max Strength',
    actions: 'Actions',
  },
  classEmpty: 'No classes yet. Add a class to get started.',
  sectionEmpty: 'No sections yet.',
  deleteButton: 'Delete',
  classForm: {
    title: 'Add Class',
    name: 'Class Name *',
    academicYear: 'Academic Year *',
    order: 'Order (numeric)',
    description: 'Description',
    submit: 'Add Class',
    cancel: 'Cancel',
  },
  sectionForm: {
    title: 'Add Section',
    name: 'Section Name *',
    class: 'Class *',
    room: 'Room Number',
    maxStrength: 'Max Strength',
    submit: 'Add Section',
    cancel: 'Cancel',
  },
  placeholders: {
    className: 'Class 1, Grade 10, etc.',
    classOrder: '1',
    description: 'Optional',
    sectionName: 'A, B, C, etc.',
    room: '101',
    maxStrength: '40',
  },
} as const;
