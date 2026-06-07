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

export const CLASS_DETAILS_PAGE = {
  title: 'Class Details',
  addButton: 'Add Class Detail',
  table: {
    class: 'Class',
    name: 'Name',
    session: 'Session',
    year: 'Year',
    classCode: 'Class Code',
    maxExams: 'Max Internal Exams',
    bestExams: 'Best Count',
    electives: 'Elective Subjects',
    enabled: 'Enabled',
    actions: 'Actions',
  },
  empty: 'No class details found.',
  form: {
    createTitle: 'Add Class Detail',
    editTitle: 'Edit Class Detail',
    session: 'Select Session',
    class: 'Select Class *',
    year: 'Year',
    name: 'Name',
    classCode: 'Class Code',
    maxInternalExam: 'Max Internal Exam',
    bestInternalExamCount: 'Best Internal Exam Count',
    noOfElectiveSubjects: 'No. of Elective Subjects',
    isEnabled: 'Enabled',
    submit: 'Create',
    update: 'Save Changes',
    cancel: 'Cancel',
  },
  placeholders: {
    session: 'Select Session',
    class: 'Select Class',
    year: 'e.g. Year 1',
    name: 'e.g. 1st',
    classCode: 'e.g. CLS-01',
  },
} as const;

export const BEST_EXAM_COUNT_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const CLASS_SEQUENCE_OPTIONS = Array.from({ length: 31 }, (_, i) => i) as number[];
