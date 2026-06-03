export const MARKING_SYSTEM_OPTIONS = [
  { value: '', label: 'Select system' },
  { value: 'MARKS', label: 'Marks' },
  { value: 'GRADES', label: 'Grades' },
  { value: 'PERCENTAGE', label: 'Percentage' },
] as const;

export const EXAMS_PAGE = {
  title: 'Exam Setup',
  addButton: 'New Exam',
  table: {
    name: 'Exam Name',
    dates: 'Dates',
    description: 'Description',
    actions: 'Actions',
  },
  empty: 'No exams found. Create your first exam.',
  form: {
    title: 'Create Exam',
    editTitle: 'Edit Exam',
    name: 'Exam Name *',
    description: 'Description',
    startDate: 'Start Date',
    endDate: 'End Date',
    submit: 'Create',
    save: 'Save Changes',
    cancel: 'Cancel',
  },
  policy: {
    title: 'Exam Policy',
    addButton: 'Add Policy',
    name: 'Policy Name *',
    passingMarks: 'Passing Marks',
    totalMarks: 'Total Marks',
    markingSystem: 'Marking System',
    graceMarks: 'Grace Marks',
    submit: 'Add Policy',
    save: 'Save',
    cancel: 'Cancel',
    empty: 'No policy set for this exam.',
  },
  students: {
    title: 'Registered Students',
    registerButton: 'Register Students',
    empty: 'No students registered.',
  },
  rooms: {
    title: 'Exam Rooms',
    addButton: 'Add Room',
    name: 'Room Name *',
    capacity: 'Capacity *',
    submit: 'Add Room',
    cancel: 'Cancel',
    empty: 'No rooms added.',
  },
  seating: {
    title: 'Seating Arrangement',
    autoGenerate: 'Auto-Generate',
    empty: 'No seating arrangement.',
  },
} as const;

export const TIMETABLE_PAGE = {
  title: 'Exam Schedule',
  addButton: 'Add Entry',
  table: {
    date: 'Date',
    subject: 'Subject',
    section: 'Section',
    time: 'Time',
    room: 'Room',
    actions: 'Actions',
  },
  empty: 'No timetable entries. Select an exam above.',
  form: {
    title: 'Add Timetable Entry',
    editTitle: 'Edit Entry',
    exam: 'Exam *',
    section: 'Section *',
    subject: 'Subject *',
    date: 'Date *',
    startTime: 'Start Time',
    endTime: 'End Time',
    room: 'Room Number',
    submit: 'Add Entry',
    save: 'Save',
    cancel: 'Cancel',
  },
} as const;

export const ADMIT_CARDS_PAGE = {
  title: 'Hall Tickets',
  generateButton: 'Generate Hall Tickets',
  previewButton: 'Preview',
  table: {
    student: 'Student',
    admitNo: 'Admit Card No',
    rollNo: 'Roll Number',
    issued: 'Issued',
    actions: 'Actions',
  },
  empty: 'Select an exam and section to view hall tickets.',
  noCards: 'No hall tickets generated yet.',
} as const;

export const EXAM_MARKS_PAGE = {
  title: 'Enter Marks',
  submitButton: 'Submit Marks',
  table: {
    student: 'Student',
    rollNo: 'Roll No',
    totalMarks: 'Total Marks',
    obtained: 'Marks Obtained',
    grade: 'Grade',
    absent: 'Absent',
  },
  empty: 'Select exam, section and subject to enter marks.',
} as const;
