export const CLASS_SUBJECT_TEACHER_PAGE = {
  title: 'Subject-Teacher Map',
  subtitle: 'Assign one teacher per subject for each class — used to auto-generate timetables.',
  classLabel: 'Class',
  academicYearLabel: 'Academic Year',
  selectClassPrompt: 'Select a class to map its subjects and teachers.',
  table: {
    subject: 'Subject',
    teacher: 'Teacher',
  },
  teacherPlaceholder: 'Select teacher',
  saveButton: 'Save Mapping',
  empty: 'No subjects found. Add subjects first from the Subjects page.',
} as const;
