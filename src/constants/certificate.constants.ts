export type CertificateType = 'transfer' | 'bonafide';

export const CERTIFICATE_PAGE = {
  title: 'Certificates',
  description: 'Issue and manage Transfer & Bonafide certificates',
  toggle: {
    transfer: 'Transfer',
    bonafide: 'Bonafide',
  },
  buttons: {
    createTransfer: 'Issue Transfer Certificate',
    createBonafide: 'Issue Bonafide Certificate',
    download: 'Download Certificate',
  },
  filters: {
    search: 'Search student name…',
    allYears: 'All Years',
    allClasses: 'All Classes',
    allSections: 'All Sections',
    allStatuses: 'All Statuses',
  },
  table: {
    sno: '#',
    referenceNo: 'Reference No.',
    studentName: 'Student',
    class: 'Class',
    section: 'Section',
    academicYear: 'Academic Year',
    status: 'Status',
    createdDate: 'Issued On',
    actions: 'Actions',
    // Transfer-specific
    leavingReason: 'Leaving Reason',
    // Bonafide-specific
    purpose: 'Purpose',
    noEntry: 'No certificates found. Issue one to get started.',
  },
  status: {
    DRAFT: 'Draft',
    GENERATED: 'Generated',
    CANCELLED: 'Cancelled',
  },
  statusBadge: {
    DRAFT: 'warning',
    GENERATED: 'success',
    CANCELLED: 'danger',
  } as Record<string, 'warning' | 'success' | 'danger' | 'default'>,
} as const;

// ─── Transfer Create Form ─────────────────────────────────────────────────────

export const TRANSFER_CERT_FORM = {
  title: 'Issue Transfer Certificate',
  subtitle: 'Fill in the details to generate a transfer certificate for the student.',
  sections: {
    student: 'Student Details',
    certificate: 'Certificate Details',
  },
  fields: {
    student_id: 'Student *',
    academic_year_id: 'Academic Year *',
    class_id: 'Class *',
    section_id: 'Section',
    qualified_for_higher_class: 'Qualified for Higher Class *',
    leaving_date: 'Date of Leaving *',
    total_working_days: 'Total Working Days *',
    total_present: 'Total Days Present *',
    extra_activities: 'Extra Activities',
    candidate_character: 'Candidate Character *',
    leaving_reason: 'Reason for Leaving *',
    fees_due: 'Fees Due *',
  },
  placeholders: {
    student_id: 'Select student',
    academic_year_id: 'Select academic year',
    class_id: 'Select class',
    section_id: 'Select section (optional)',
    qualified_for_higher_class: 'Select',
    leaving_date: 'DD/MM/YYYY',
    total_working_days: 'e.g. 220',
    total_present: 'e.g. 198',
    extra_activities: 'Sports, Music, etc. (optional)',
    candidate_character: 'e.g. GOOD',
    leaving_reason: 'e.g. PARENT TRANSFER',
    fees_due: 'Select',
  },
  options: {
    qualified: [
      { value: 'YES', label: 'Yes' },
      { value: 'NO', label: 'No' },
    ],
    feesDue: [
      { value: 'NO', label: 'No' },
      { value: 'YES', label: 'Yes' },
    ],
  },
  submit: 'Issue Certificate',
  cancel: 'Cancel',
} as const;

// ─── Bonafide Create Form ─────────────────────────────────────────────────────

export const BONAFIDE_CERT_FORM = {
  title: 'Issue Bonafide Certificate',
  subtitle: 'Fill in the details to generate a bonafide certificate for the student.',
  sections: {
    student: 'Student Details',
    certificate: 'Certificate Details',
  },
  fields: {
    student_id: 'Student *',
    academic_year_id: 'Academic Year *',
    class_id: 'Class *',
    section_id: 'Section',
    purpose: 'Purpose *',
  },
  placeholders: {
    student_id: 'Select student',
    academic_year_id: 'Select academic year',
    class_id: 'Select class',
    section_id: 'Select section (optional)',
    purpose: 'e.g. Bank Account Opening',
  },
  submit: 'Issue Certificate',
  cancel: 'Cancel',
} as const;

// ─── View Page ────────────────────────────────────────────────────────────────

export const CERTIFICATE_VIEW = {
  back: 'Back',
  downloadButton: 'Download Certificate',
  pdfModalTitle: 'Certificate PDF',
  pdfNotAvailable: 'PDF not yet generated for this certificate.',
  transfer: {
    sections: {
      student: 'Student Information',
      certificate: 'Certificate Details',
      attendance: 'Attendance',
    },
    labels: {
      referenceNo: 'Reference No.',
      studentName: 'Student Name',
      dateOfBirth: 'Date of Birth',
      class: 'Class',
      section: 'Section',
      academicYear: 'Academic Year',
      qualifiedForHigher: 'Qualified for Higher Class',
      leavingDate: 'Date of Leaving',
      totalWorkingDays: 'Total Working Days',
      totalPresent: 'Total Present',
      extraActivities: 'Extra Activities',
      candidateCharacter: 'Candidate Character',
      leavingReason: 'Leaving Reason',
      feesDue: 'Fees Due',
      status: 'Status',
      issuedOn: 'Issued On',
    },
  },
  bonafide: {
    sections: {
      student: 'Student Information',
      certificate: 'Certificate Details',
    },
    labels: {
      referenceNo: 'Reference No.',
      studentName: 'Student Name',
      dateOfBirth: 'Date of Birth',
      class: 'Class',
      section: 'Section',
      academicYear: 'Academic Year',
      purpose: 'Purpose',
      status: 'Status',
      issuedOn: 'Issued On',
    },
  },
} as const;