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
  academicYears: {
    list: '/academic-years',
    current: '/academic-years/current',
    byId: (id: string) => `/academic-years/${id}`,
    setCurrent: (id: string) => `/academic-years/${id}/set-current`,
  },
  classes: {
    list: '/classes',
    byId: (id: string) => `/classes/${id}`,
  },
  sections: {
    list: '/sections',
    byId: (id: string) => `/sections/${id}`,
  },
  subjects: {
    list: '/subjects',
    byId: (id: string) => `/subjects/${id}`,
  },
  students: {
    list: '/students',
    byId: (id: string) => `/students/${id}`,
    parents: (studentId: string) => `/students/${studentId}/parents`,
    parentById: (studentId: string, parentId: string) => `/students/${studentId}/parents/${parentId}`,
    documents: (studentId: string) => `/students/${studentId}/documents`,
    documentById: (studentId: string, docId: string) => `/students/${studentId}/documents/${docId}`,
  },
  subscriptions: {
    list: '/subscriptions',
    my: '/subscriptions/my',
    byId: (id: string) => `/subscriptions/${id}`,
    cancel: (id: string) => `/subscriptions/${id}/cancel`,
    payments: (id: string) => `/subscriptions/${id}/payments`,
  },
};
