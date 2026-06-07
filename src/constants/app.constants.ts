export const APP = {
  name: 'School ERP',
  tagline: 'Sign in to your account',
} as const;

export const STORAGE_KEYS = {
  accessToken: 'auth:access_token',
  refreshToken: 'auth:refresh_token',
  context: 'auth:context',
  isAuthenticated: 'auth:is_authenticated',
  user: 'auth:user',
} as const;

export const ROUTES = {
  root: '/',
  login: '/login',
  signup: '/signup',
  setupPassword: '/setup-password',
  // Super admin routes
  dashboard: '/dashboard',
  schools: '/schools',
  subscriptions: '/subscriptions',
  // School admin routes
  schoolDashboard: '/school',
  academicYears: '/school/academic-years',
  academicYearNew: '/school/academic-years/new',
  academicYearEdit: (id: string) => `/school/academic-years/${id}/edit`,
  classes: '/school/classes',
  classNew: '/school/classes/new',
  classEdit: (id: string) => `/school/classes/${id}/edit`,
  classDetailNew: '/school/class-details/new',
  classDetailEdit: (id: string) => `/school/class-details/${id}/edit`,
  departments: '/school/departments',
  departmentNew: '/school/departments/new',
  departmentEdit: (id: string) => `/school/departments/${id}/edit`,
  subjects: '/school/subjects',
  subjectNew: '/school/subjects/new',
  subjectEdit: (id: string) => `/school/subjects/${id}/edit`,
  students: '/students',
  studentDetail: (id: string) => `/students/${id}`,
  staffs: '/staffs',
  parents: '/parents',
} as const;
