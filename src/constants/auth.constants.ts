import { AuthLoginTab } from '@/types';

export const AUTH_TABS = [
  { value: AuthLoginTab.COMPANY, label: 'Company' },
  { value: AuthLoginTab.SCHOOL, label: 'School' },
] as const;

export const COMPANY_LOGIN_FORM = {
  labels: {
    email: 'Email',
    password: 'Password',
  },
  placeholders: {
    email: 'you@company.com',
    password: '••••••••',
  },
  submit: {
    idle: 'Sign in',
    loading: 'Signing in…',
  },
} as const;

export const SCHOOL_LOGIN_FORM = {
  labels: {
    phone: 'Phone Number',
    password: 'Password',
  },
  placeholders: {
    dialCode: '+91',
    phone: '9876543210',
    password: '••••••••',
  },
  submit: {
    idle: 'Sign in',
    loading: 'Signing in…',
  },
} as const;
