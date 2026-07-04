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
    profile: "/schools/profile",
  },
  schoolSettings: {
    settings: "/school-settings",
    timings: "/school-settings/timings",
    timingById: (id: string) => `/school-settings/timings/${id}`,
    classTimings: "/school-settings/class-timings",
    classTimingByClass: (classId: string) => `/school-settings/class-timings/${classId}`,
  },
  academicYears: {
    list: "/academic-years",
    current: "/academic-years/current",
    byId: (id: string) => `/academic-years/${id}`,
    setCurrent: (id: string) => `/academic-years/${id}/set-current`,
    freeze: (id: string) => `/academic-years/${id}/freeze`,
    unfreeze: (id: string) => `/academic-years/${id}/unfreeze`,
    rollover: "/academic-years/rollover",
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
  classSubjectTeachers: {
    list: "/class-subject-teachers",
    byId: (id: string) => `/class-subject-teachers/${id}`,
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
    auditLog: (id: string) => `/attendance/${id}/audit`,
    missingPunches: '/attendance/missing-punches',
    resolvePunch: (punchId: string) => `/attendance/missing-punches/${punchId}/resolve`,
    dashboard: '/attendance/dashboard/today',
    heatmap: '/attendance/heatmap',
    lateTrend: '/attendance/late-trend',
    conflicts: '/attendance/conflicts',
    resolveConflict: (id: string) => `/attendance/conflicts/${id}/resolve`,
  },
  earlyExits: {
    base: '/early-exits',
    approve: (id: string) => `/early-exits/${id}/approve`,
    reject: (id: string) => `/early-exits/${id}/reject`,
    byId: (id: string) => `/early-exits/${id}`,
  },
  gatePasses: {
    base: '/gate-passes',
    approve: (id: string) => `/gate-passes/${id}/approve`,
    reject: (id: string) => `/gate-passes/${id}/reject`,
    use: (qr: string) => `/gate-passes/use/${qr}`,
    byId: (id: string) => `/gate-passes/${id}`,
  },
  notificationRules: { base: '/notification-rules' },
  auditLogs: { base: '/audit-logs' },
  staffAttendance: {
    base: "/staff-attendance",
    staff: "/staff-attendance/staff",
    daily: "/staff-attendance/daily",
    export: "/staff-attendance/export",
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
  staffShifts: {
    list: '/staff-shifts',
    byStaff: (staffId: string) => `/staff-shifts/staff/${staffId}`,
    activeByStaff: (staffId: string) => `/staff-shifts/staff/${staffId}/active`,
    byId: (id: string) => `/staff-shifts/${id}`,
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
    workflows: "/leave/workflows",
    workflowSteps: (requestId: string) => `/leave/workflows/steps/${requestId}`,
    reviewStep: (stepId: string) => `/leave/workflows/steps/${stepId}/review`,
    studentMovements: "/student-movements",
    studentMovementsByStudent: (studentId: string, date: string) =>
      `/student-movements?student_id=${studentId}&date=${date}`,
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
  timetable: {
    list: "/timetable",
    byId: (id: string) => `/timetable/${id}`,
    employeeView: (teacherId: string) => `/timetable/employee/${teacherId}`,
    sessionView: "/timetable/session-view",
    autoGenerate: "/timetable/auto-generate",
  },
  syllabus: {
    list: "/syllabi",
    byId: (id: string) => `/syllabi/${id}`,
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
    guardiansAll: "/students/guardians/all",
    guardians: (studentId: string) => `/students/${studentId}/guardians`,
    guardian: (guardianId: string) => `/students/guardians/${guardianId}`,
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
  search: {
    global: "/search",
  },
  dashboard: {
    admin: "/dashboard/admin",
    teacher: "/dashboard/teacher",
    parent: "/dashboard/parent",
  },
};

/* ------------------------------------- 
EXAM_ENDPOINTS
-------------------------------------  */
export const EXAM_ENDPOINTS = {
  grading: {
    list: "/exam/grading",
    bulk: "/exam/grading/bulk",
    byId: (id: string) => `/exam/grading/${id}`,
  },
  exams: {
    list: "/exam/exams",
    byId: (id: string) => `/exam/exams/${id}`,
    publish: (id: string) => `/exam/exams/${id}/publish`,
    autoGenerate: "/exam/exams/auto-generate",
    status: (id: string) => `/exam/exams/${id}/status`,
    copy: (id: string) => `/exam/exams/${id}/copy`,
    restore: (id: string) => `/exam/exams/${id}/restore`,
    regeneratePreview: (id: string) => `/exam/exams/${id}/regenerate-preview`,
    regenerateApply: (id: string) => `/exam/exams/${id}/regenerate-apply`,
  },
  templates: {
    list: "/exam/templates",
    byId: (id: string) => `/exam/templates/${id}`,
  },
  schedules: {
    list: "/exam/schedules",
    byId: (id: string) => `/exam/schedules/${id}`,
    bulk: "/exam/schedules/bulk",
    bulkMultiClass: "/exam/schedules/bulk-multi-class",
    bulkLock: "/exam/schedules/bulk-lock",
    bulkUpdate: "/exam/schedules/bulk-update",
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
  hallDetails: {
    list: "/exam/hall-details",
    byId: (id: string) => `/exam/hall-details/${id}`,
  },
  sittingPlans: {
    list: "/exam/sitting-plans",
    byId: (id: string) => `/exam/sitting-plans/${id}`,
    bulk: "/exam/sitting-plans/bulk",
    autoShuffle: "/exam/sitting-plans/auto-shuffle",
    roomPdf: "/exam/sitting-plans/room-pdf",
    masterPdf: "/exam/sitting-plans/master-pdf",
  },
  admitCard: {
    data: "/exam/admit-card/data",
    pdf: "/exam/admit-card/pdf",
  },
} as const;


/* ------------------------------------- 
RESULT_ENDPOINTS
-------------------------------------  */

export const RESULT_ENDPOINTS = {
  examResults: {
    list: '/exam-results',
    bulk: '/exam-results/bulk',
    publish: '/exam-results/publish',
  },
  examSchedules: {
    byExam: (examId: string) => `/exam/schedules?exam_id=${examId}`,
  },
  reportCards: {
    list: '/report-cards',
    byId: (id: string) => `/report-cards/${id}`,
    generate: '/report-cards/generate',
    publish: '/report-cards/publish',
  },
} as const;



export const EMP_LEAVE_ENDPOINTS = {
  leaveTypes: {
    list: '/leave-types',
    byId: (id: string) => `/leave-types/${id}`,
  },
  leaveAssigned: {
    byEmployee: (employeeId: string) => `/employees/${employeeId}/leaves`,
    byAssignment: (employeeId: string, assignmentId: string) =>
      `/employees/${employeeId}/leaves/${assignmentId}`,
  },
  leaveApplications: {
    list: '/leave-applications',
    byId: (id: string) => `/leave-applications/${id}`,
    review: (id: string) => `/leave-applications/${id}/review`,
    cancel: (id: string) => `/leave-applications/${id}/cancel`,
     adminApply: '/leave-applications/admin-apply',  
  },
};
