export const ENDPOINTS = {
  auth: {
    companyRegister: "/auth/company/register",
    companyLogin: "/auth/company/login",
    schoolLogin: "/auth/school/login",
    schoolSignup: "/auth/school/signup",
    login: "/auth/login",
    setupPassword: "/auth/school/setup-password",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    switchSchool: (schoolId: string) => `/auth/switch-school/${schoolId}`,
  },
  schools: {
    list: "/schools",
    byId: (id: string) => `/schools/${id}`,
  },
  academicYears: {
    list: "/academic-years",
    current: "/academic-years/current",
    byId: (id: string) => `/academic-years/${id}`,
    setCurrent: (id: string) => `/academic-years/${id}/set-current`,
  },
  classes: {
    list: "/classes",
    byId: (id: string) => `/classes/${id}`,
  },
  sections: {
    list: "/sections",
    byId: (id: string) => `/sections/${id}`,
  },
  subjects: {
    list: "/subjects",
    byId: (id: string) => `/subjects/${id}`,
  },
  classSubjects: {
    list: "/class-subjects",
    byId: (id: string) => `/class-subjects/${id}`,
  },
  masterData: {
    subjects: "/master-data/subjects",
  },
  schoolEvents: {
    list: "/school-events",
    byId: (id: string) => `/school-events/${id}`,
  },
  students: {
    list: "/students",
    byId: (id: string) => `/students/${id}`,
    parents: (studentId: string) => `/students/${studentId}/parents`,
    parentById: (studentId: string, parentId: string) =>
      `/students/${studentId}/parents/${parentId}`,
    documents: (studentId: string) => `/students/${studentId}/documents`,
    documentById: (studentId: string, docId: string) =>
      `/students/${studentId}/documents/${docId}`,
  },
  subscriptions: {
    list: "/subscriptions",
    my: "/subscriptions/my",
    byId: (id: string) => `/subscriptions/${id}`,
    cancel: (id: string) => `/subscriptions/${id}/cancel`,
    payments: (id: string) => `/subscriptions/${id}/payments`,
  },
  attendance: {
    base: "/attendance",
    byId: (id: string) => `/attendance/${id}`,
    daily: "/attendance/daily",
    monthly: "/attendance/monthly",
    defaulters: "/attendance/defaulters",
    export: "/attendance/export",
    studentHistory: (studentId: string) => `/attendance/students/${studentId}`,
    studentSummary: (studentId: string) =>
      `/attendance/students/${studentId}/summary`,
    bySection: (sectionId: string) => `/attendance/classSection/${sectionId}`,
    bySectionDate: (sectionId: string, date: string) =>
      `/attendance/classSection/${sectionId}/date/${date}`,
  },
  staffAttendance: {
    base: "/staff-attendance",
    staff: "/staff-attendance/staff",
    daily: "/staff-attendance/daily",
  },
  staff: {
    list: "/staff",
    bulkTemplate: "/staff/bulk/template",
    bulkImport: "/staff/bulk/import",
    bulkStatus: (jobId: string) => `/staff/bulk/status/${jobId}`,
    byId: (id: string) => `/staff/${id}`,
    offboard: (id: string) => `/staff/${id}/offboard`,
    reonboard: (id: string) => `/staff/${id}/reonboard`,
  },
  invite: {
    verifyToken: "/invite/verify-token",
    resend: (userId: string) => `/invite/resend/${userId}`,
  },
  uploads: {
    image: "/uploads/image",
    document: "/uploads/document",
    delete: "/uploads",
  },
  homework: {
    list: "/homework",
    parent: "/homework/parent",
    byId: (id: string) => `/homework/${id}`,
    submissions: (hwId: string) => `/homework/${hwId}/submissions`,
    studentSubmission: (hwId: string, studentId: string) =>
      `/homework/${hwId}/submissions/${studentId}`,
    parentList: "/parents/homeworks",
  },
  studyMaterials: {
    list: "/study-materials",
    byId: (id: string) => `/study-materials/${id}`,
  },
  fees: {
    types: "/fees/types",
    typeById: (id: string) => `/fees/types/${id}`,
    plans: "/fees/plans",
    planById: (id: string) => `/fees/plans/${id}`,
    classStructure: "/fees/class-structure",
    classStructureView: "/fees/class-structure-view",
    transportRoutes: "/fees/transport-routes",
    transportRouteById: (id: string) => `/fees/transport-routes/${id}`,
    transportRouteFees: (id: string) => `/fees/transport-routes/${id}/fees`,
    bills: "/fees/bills",
    studentBills: (studentId: string) => `/fees/bills/student/${studentId}`,
    billPayments: (id: string) => `/fees/bills/${id}/payments`,
    generateClass: "/fees/bills/generate-class",
    generateForStudent: "/fees/bills/generate-for-student",
    payBill: (id: string) => `/fees/bills/${id}/pay`,
    deletePayment: (id: string) => `/fees/bills/payments/${id}`,
    monthlyDues: "/fees/monthly-dues",
    bulkDiscount: "/fees/bulk-discount",
    bulkExtra: "/fees/bulk-extra",
    demandReceipt: "/fees/demand-receipt",
    lateRules: "/fees/late-rules",
    lateRuleById: (id: string) => `/fees/late-rules/${id}`,
  },
  leave: {
    policies: "/leave/policies",
    policyById: (id: string) => `/leave/policies/${id}`,
    policyTypes: (leaveTypeId: string) =>
      `/leave/policies/types/${leaveTypeId}`,
    provision: (policyId: string) => `/leave/policies/${policyId}/provision`,
    teacherApply: "/leave/teacher/apply",
    teacherMyRequests: "/leave/teacher/my-requests",
    teacherMySummary: "/leave/teacher/my-summary",
    teacherAll: "/leave/teacher/all",
    teacherStaffSummary: "/leave/teacher/staff-summary",
    teacherReview: (requestId: string) => `/leave/teacher/review/${requestId}`,
    teacherById: (requestId: string) => `/leave/teacher/${requestId}`,
    studentAll: "/leave/student/all",
    studentReview: (requestId: string) => `/leave/student/review/${requestId}`,
    studentById: (requestId: string) => `/leave/student/${requestId}`,
    parentApply: "/leave/parent/apply",
    parentMyRequests: "/leave/parent/my-requests",
    parentStudentSummary: (studentId: string) =>
      `/leave/parent/student/${studentId}/summary`,
  },
  exams: {
    list: "/exams",
    byId: (id: string) => `/exams/${id}`,
    policy: "/exam-policy",
    policyById: (id: string) => `/exam-policy/${id}`,
    timetable: "/exam-timetable",
    timetableById: (id: string) => `/exam-timetable/${id}`,
    students: "/exam-students",
    registerStudents: "/exam-students/register",
    studentEligibility: (examId: string, studentId: string) =>
      `/exam-students/eligibility/${examId}/${studentId}`,
    studentById: (id: string) => `/exam-students/${id}`,
    rooms: "/exam-rooms",
    roomById: (id: string) => `/exam-rooms/${id}`,
    seating: "/exam-seating",
    seatingAutoGenerate: "/exam-seating/auto-generate",
    seatingById: (id: string) => `/exam-seating/${id}`,
    admitCards: "/admit-cards",
    admitCardGenerate: "/admit-cards/generate",
    admitCardGenerateClass: "/admit-cards/generate-class",
    admitCardStudent: "/admit-cards/student",
    admitCardPreview: "/admit-cards/preview",
    admitCardClass: "/admit-cards/class",
    marks: "/exam-marks",
    marksBulk: "/exam-marks/bulk",
    remarks: "/teacher-remarks",
    markSheetStudent: (studentId: string) => `/mark-sheet/student/${studentId}`,
    markSheetClass: "/mark-sheet/class",
    markSheetStudentAnnual: (studentId: string) =>
      `/mark-sheet/student/${studentId}/annual`,
    markSheetClassAnnual: "/mark-sheet/class/annual",
  },
  parent: {
    list: "/parent",
    bulkTemplate: "/parent/bulk/template",
    bulkImport: "/parent/bulk/import",
    bulkStatus: (jobId: string) => `/parent/bulk/status/${jobId}`,
    studentDetail: (id: string) => `/parent/student-detail/${id}`,
    byId: (id: string) => `/parent/${id}`,
    linkStudent: (id: string, studentId: string) =>
      `/parent/${id}/link-student/${studentId}`,
  },
  timetable: {
    list: "/timetable",
    byId: (id: string) => `/timetable/${id}`,
    employeeView: (teacherId: string) => `/timetable/employee/${teacherId}`,
    sessionView: "/timetable/session-view",
  },
  classDetails: {
    list: "/class-details",
    byId: (id: string) => `/class-details/${id}`,
  },
  syllabus: {
    list: "/syllabi",
    byId: (id: string) => `/syllabi/${id}`,
  },
  departments: {
    list: "/departments",
    byId: (id: string) => `/departments/${id}`,
  },
  roles: {
    list: "/roles",
    byId: (id: string) => `/roles/${id}`,
    permissions: (id: string) => `/roles/${id}/permissions`,
  },
  permissions: {
    list: "/permissions",
  },
  classTypes: {
    list: "/class-types",
    byId: (id: string) => `/class-types/${id}`,
  },

  // Add inside your ENDPOINTS object:
  admissionSources: {
    list: "/admission-sources",
    byId: (id: string) => `/admission-sources/${id}`,
  },
  admissionEnquiries: {
    list: "/admission-enquiries",
    byId: (id: string) => `/admission-enquiries/${id}`,
    history: (id: string) => `/admission-enquiries/${id}/history`,
  },
  student: {
    list: "/students",
    byId: (id: string) => `/students/${id}`,
    enable: (id: string) => `/students/${id}/enable`,
    disable: (id: string) => `/students/${id}/disable`,
    documents: (id: string) => `/students/${id}/documents`,
    document: (id: string, docId: string) =>
      `/students/${id}/documents/${docId}`,
    idCard: (id: string) => `/students/${id}/id-card`,
    pickupCard: (id: string) => `/students/${id}/pickup-card`,
  },
  financeAccounts: {
    list: "/finance/accounts",
    byId: (id: string) => `/finance/accounts/${id}`,
  },
  financeHeads: {
    list: "/finance/heads",
    byId: (id: string) => `/finance/heads/${id}`,
  },
  financeExpenses: {
    list: "/finance/expenses",
    byId: (id: string) => `/finance/expenses/${id}`,
  },
  financeIncome: {
    list: "/finance/income",
    byId: (id: string) => `/finance/income/${id}`,
  },
  financeTransfers: {
    list: "/finance/transfers",
    byId: (id: string) => `/finance/transfers/${id}`,
  },
  financeReports: {
    statement: "/finance/reports/statement",
    register: "/finance/reports/register",
    profitLoss: "/finance/reports/profit-loss",
  },
  salaryHeads: {
    list: "/salary/heads",
    byId: (id: string) => `/salary/heads/${id}`,
  },
  salaryTemplates: {
    list: "/salary/templates",
    byId: (id: string) => `/salary/templates/${id}`,
  },
  salaryAssignments: {
    list: "/salary/assignments",
    byEmployee: (employeeId: string) =>
      `/salary/assignments/employee/${employeeId}`,
    byId: (id: string) => `/salary/assignments/${id}`,
  },
  salaryTransactions: {
    list: "/salary/transactions",
    byId: (id: string) => `/salary/transactions/${id}`,
    process: (id: string) => `/salary/transactions/${id}/process`,
  },
  rfid: {
    webhook: "/rfid/webhook",
    events: "/rfid/events",
    search: "/rfid/search",
    assign: "/rfid/assign",
    unassign: "/rfid/unassign",
  },
};

/* ------------------------------------- 
EXAM_ENDPOINTS
-------------------------------------  */
export const EXAM_ENDPOINTS = {
  grading: {
    list: "/exam/grading",
    byId: (id: string) => `/exam/grading/${id}`,
  },
  exams: {
    list: "/exam/exams",
    byId: (id: string) => `/exam/exams/${id}`,
    publish: (id: string) => `/exam/exams/${id}/publish`,
  },
  schedules: {
    list: "/exam/schedules",
    byId: (id: string) => `/exam/schedules/${id}`,
    bulk: "/exam/schedules/bulk",
  },
  attendance: {
    list: "/exam/attendance",
    bySchedule: (scheduleId: string) =>
      `/exam/attendance/schedule/${scheduleId}`,
    bulk: "/exam/attendance/bulk",
  },
  attendanceCard: {
    data: "/exam/attendance-card/data",
    pdf: "/exam/attendance-card/pdf",
  },
  hallPlans: {
    list: "/exam/hall-plans",
    byId: (id: string) => `/exam/hall-plans/${id}`,
  },
  hallDetails: {
    list: "/exam/hall-details",
    byId: (id: string) => `/exam/hall-details/${id}`,
  },
  sittingPlans: {
    list: "/exam/sitting-plans",
    byId: (id: string) => `/exam/sitting-plans/${id}`,
    bulk: "/exam/sitting-plans/bulk",
  },
  admitCard: {
    data: "/exam/admit-card/data",
    pdf: "/exam/admit-card/pdf",
  },
} as const;
