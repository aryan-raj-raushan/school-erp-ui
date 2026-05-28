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
  // Super admin routes
  dashboard: '/dashboard',
  schools: '/dashboard/schools',
  subscriptions: '/dashboard/subscriptions',
  // School admin routes
  schoolDashboard: '/dashboard/school',
  academicYears: '/dashboard/school/academic-years',
  classes: '/dashboard/school/classes',
  students: '/dashboard/school/students',
  studentDetail: (id: string) => `/dashboard/school/students/${id}`,
} as const;
