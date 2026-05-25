export const ENDPOINTS = {
  auth: {
    companyRegister: '/auth/company/register',
    companyLogin: '/auth/company/login',
    schoolLogin: '/auth/school/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  schools: {
    list: '/schools',
    byId: (id: string) => `/schools/${id}`,
  },
} as const;
