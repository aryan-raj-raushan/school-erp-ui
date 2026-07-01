export const ALL_SECTION_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] as const;

export const CLASSES_PAGE = {
  title: 'Classes & Sections',
  addClassButton: 'Add Class',
  classTable: {
    name: 'Name',
    session: 'Session',
    department: 'Department',
    classType: 'Type',
    sections: 'Sections',
    academicYear: 'Academic Year',
    actions: 'Actions',
  },
  classEmpty: 'No classes yet. Add a class to get started.',
  form: {
    createTitle: 'Add Class',
    editTitle: 'Edit Class',
    session: 'Session',
    name: 'Name *',
    department: 'Department *',
    classType: 'Class Type',
    classSequence: 'Class Sequence',
    noOfSessions: 'No. of Sessions',
    classCode: 'Class Code',
    sections: 'Class Section',
    description: 'Description',
    isActive: 'Enabled',
    submit: 'Create Class',
    update: 'Save Changes',
    cancel: 'Cancel',
  },
  placeholders: {
    session: 'Select Session',
    name: 'Enter Name',
    department: 'Enter Department',
    classType: 'e.g. Regular, Elective',
    classSequence: '1',
    noOfSessions: '1',
    classCode: 'Enter Course Code',
    description: 'Enter Description',
  },
} as const;

export const CLASS_SEQUENCE_OPTIONS = Array.from({ length: 31 }, (_, i) => i) as number[];
