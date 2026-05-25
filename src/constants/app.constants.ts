export const APP = {
  name: 'School ERP',
  tagline: 'Sign in to your account',
} as const;

export const STORAGE_KEYS = {
  accessToken: 'auth:access_token',
  refreshToken: 'auth:refresh_token',
  context: 'auth:context',
  isAuthenticated: 'auth:is_authenticated',
} as const;

export const ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  schools: '/dashboard/schools',
  schoolDashboard: '/dashboard/school',
} as const;
