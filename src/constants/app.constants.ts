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
  schools: '/schools',
  subscriptions: '/subscriptions',
  // School admin routes
  schoolDashboard: '/school',
  academicYears: '/school/academic-years',
  classes: '/school/classes',
  students: '/students',
  studentDetail: (id: string) => `/students/${id}`,
  staffs: '/staffs',
  parents: '/parents',
} as const;
