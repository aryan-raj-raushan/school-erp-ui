// ─── Routes ────────────────────────────────────────────────────────────────────

export const STUDENT_ROUTES = {
  list: "/students",
  createNew: "/students/create-new",
  view: (id: string) => `/students/view?id=${id}`,
  edit: (id: string) => `/students/view?id=${id}&edit=true`,
  generate: "/students/generate",
} as const;

// ─── Page Text ─────────────────────────────────────────────────────────────────

export const STUDENT_PAGE = {
  pageHeading: {
    title: "Students",
    subtitle: "",
  },
  buttons: {
    addStudent: "Add Student",
    export: "Export",
    generateCards: "Generate ID Cards",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    enable: "Enable",
    disable: "Disable",
    addDocument: "Add Document",
    generateIdCard: "Student ID Card",
    generatePickupCard: "Pickup Card",
    downloadCard: "Download",
    printCard: "Print",
    selectTemplate: "Use This Template",
  },
  table: {
    sno: "S. No.",
    systemNo: "Sys. No.",
    studentName: "Student Name",
    class: "Class",
    section: "Section",
    gender: "Gender",
    phone: "Phone",
    admissionNo: "Admission No.",
    rollNo: "Roll No.",
    status: "Status",
    actions: "Actions",
    noEntry: "No students found",
  },
  sections: {
    basicInfo: "Basic Information",
    academicInfo: "Academic Information",
    previousAcademics: "Previous Academic Details",
    address: "Address",
    hostelInfo: "Hostel Information",
    parents: "Parent / Guardian Details",
    documents: "Documents",
  },
  labels: {
    profile_image: "Profile Image",
    firstName: "First Name",
    lastName: "Last Name",
    dob: "Date of Birth",
    gender: "Gender",
    bloodGroup: "Blood Group",
    religion: "Religion",
    category: "Category",
    caste: "Caste",
    nationality: "Nationality",
    aadhaar: "Aadhaar Number",
    idCardNumber: "ID Card Number",
    height: "Height (cm)",
    weight: "Weight (kg)",
    phone: "Phone Number",
    dialCode: "Dial Code",
    email: "Email",
    status: "Status",
    isEnabled: "Enabled",
    // Academic
    academicYear: "Academic Year",
    class: "Class",
    section: "Section",
    admissionNumber: "Admission Number",
    registrationNumber: "Registration Number",
    rollNumber: "Roll Number",
    joiningDate: "Joining Date",
    // Previous
    previousSchool: "Previous School Name",
    previousClass: "Previous Class",
    passingYear: "Passing Year",
    totalMarks: "Total Marks / Grade",
    board: "Board",
    tcNumber: "TC Number",
    // Address
    address: "Address",
    city: "City",
    state: "State",
    pincode: "Pincode",
    country: "Country",
    // Hostel
    hostelRequired: "Hostel Required",
    hostelName: "Hostel Name",
    roomNumber: "Room Number",
    // Parent
    relation: "Relation",
    parentFirstName: "First Name",
    parentLastName: "Last Name",
    parentPhone: "Phone",
    alternatePhone: "Alternate Phone",
    parentEmail: "Email",
    occupation: "Occupation",
    qualification: "Qualification",
    annualIncome: "Annual Income",
    parentAadhaar: "Aadhaar Number",
    isPrimary: "Primary Contact",
    canPickup: "Can Pickup",
    // Document
    documentName: "Document Type",
    fileType: "File Type",
    documentLink: "Document Link / URL",
    originalFilename: "Original Filename",
    remarks: "Remarks",
  },
  filters: {
    search: "Search by name, phone, email…",
    allYears: "All Years",
    allClasses: "All Classes",
    allSections: "All Sections",
    allStatus: "All Status",
    allGender: "All Gender",
  },
  toasts: {
    createSuccess: "Student created successfully",
    updateSuccess: "Student updated successfully",
    deleteSuccess: "Student deleted",
    deleteError: "Failed to delete student",
    enableSuccess: "Student enabled",
    disableSuccess: "Student disabled",
    documentAdded: "Document added",
    documentDeleted: "Document removed",
    fetchError: "Failed to load student data",
  },
  generate: {
    title: "Generate ID Cards",
    subtitle: "Select a student and template to generate identity cards",
    idCardTitle: "Student Identity Card",
    pickupCardTitle: "Parent Pickup Card",
    chooseTemplate: "Choose Template",
    templates: {
      classic: "Classic",
      modern: "Modern",
      minimal: "Minimal",
    },
    noStudent: "Select a student to preview the card",
  },
} as const;

// ─── Enum Options ──────────────────────────────────────────────────────────────

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

export const BLOOD_GROUP_OPTIONS = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
] as const;

export const RELIGION_OPTIONS = [
  { value: "HINDU", label: "Hindu" },
  { value: "MUSLIM", label: "Muslim" },
  { value: "CHRISTIAN", label: "Christian" },
  { value: "SIKH", label: "Sikh" },
  { value: "JAIN", label: "Jain" },
  { value: "BUDDHIST", label: "Buddhist" },
  { value: "OTHER", label: "Other" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "OTHER", label: "Other" },
] as const;

export const STUDENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "TRANSFERRED", label: "Transferred" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "DROPPED", label: "Dropped" },
] as const;

export const PARENT_RELATION_OPTIONS = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "GRANDPARENT", label: "Grandparent" },
  { value: "SIBLING", label: "Sibling" },
  { value: "OTHER", label: "Other" },
] as const;

export const QUALIFICATION_OPTIONS = [
  { value: "BELOW_10TH", label: "Below 10th" },
  { value: "CLASS_10TH", label: "10th" },
  { value: "CLASS_12TH", label: "12th" },
  { value: "UNDERGRADUATE", label: "Undergraduate (UG)" },
  { value: "POSTGRADUATE", label: "Postgraduate (PG)" },
  { value: "MASTERS", label: "Masters" },
  { value: "DOCTORATE", label: "Doctorate (PhD)" },
  { value: "OTHER", label: "Other" },
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "BIRTH_CERTIFICATE", label: "Birth Certificate" },
  { value: "TRANSFER_CERTIFICATE", label: "Transfer Certificate (TC)" },
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "PHOTO", label: "Photograph" },
  { value: "MEDICAL_CERTIFICATE", label: "Medical Certificate" },
  { value: "CASTE_CERTIFICATE", label: "Caste Certificate" },
  { value: "INCOME_CERTIFICATE", label: "Income Certificate" },
  { value: "PREVIOUS_MARKSHEET", label: "Previous Marksheet" },
  { value: "MERIT_CERTIFICATE", label: "Merit Certificate" },
  { value: "REPORT", label: "Report" },
  { value: "OTHER", label: "Other" },
] as const;

export const DOCUMENT_FILE_TYPE_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "IMAGE", label: "Image" },
] as const;

// ─── Status Badge Mapping ──────────────────────────────────────────────────────

export const STATUS_BADGE: Record<
  string,
  "success" | "warning" | "danger" | "default" | "info"
> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  TRANSFERRED: "info",
  GRADUATED: "default",
  DROPPED: "danger",
};

// ─── Card Templates ────────────────────────────────────────────────────────────

export const CARD_TEMPLATES = [
  {
    id: "classic",
    label: "Classic Navy",
    description: "Navy header with gold accents, badge-style photo",
  },
  {
    id: "modern",
    label: "Modern Slate",
    description: "Dark slate header with a vivid cyan accent",
  },
  {
    id: "minimal",
    label: "Minimal Graphite",
    description: "Clean white card with subtle graphite borders",
  },
  {
    id: "ribbon-crimson",
    label: "Ribbon Crimson",
    description: "Bold crimson color-block with a corner ribbon",
  },
  {
    id: "ribbon-emerald",
    label: "Ribbon Emerald",
    description: "Emerald color-block with a corner ribbon",
  },
  {
    id: "band-indigo",
    label: "Indigo Band",
    description: "Slim indigo side band, editorial layout",
  },
  {
    id: "band-amber",
    label: "Amber Band",
    description: "Slim amber side band on a charcoal frame",
  },
  {
    id: "executive-charcoal",
    label: "Executive Charcoal",
    description: "Landscape corporate badge with a charcoal panel",
  },
  {
    id: "executive-platinum",
    label: "Executive Platinum",
    description: "Landscape corporate badge in cool platinum blue",
  },
  {
    id: "heritage-crest",
    label: "Heritage Crest",
    description: "Formal ivory & gold card with a centered emblem",
  },
  {
    id: "secure-access",
    label: "Secure Access",
    description: "Dark security badge with QR verification panel",
  },
  {
    id: "junior-pastel",
    label: "Junior Pastel",
    description: "Soft pastel card designed for younger grades",
  },
] as const;

export type CardTemplateId = (typeof CARD_TEMPLATES)[number]["id"];
