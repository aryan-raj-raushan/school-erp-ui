import type { AxiosRequestConfig } from 'axios';

// ─── Role ─────────────────────────────────────────────────────────────────────

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

// ─── AuthContext ───────────────────────────────────────────────────────────────

export const AuthContext = {
  COMPANY: 'COMPANY',
  SCHOOL: 'SCHOOL',
} as const;

export type AuthContext = (typeof AuthContext)[keyof typeof AuthContext];

// ─── AuthLoginTab ──────────────────────────────────────────────────────────────

export const AuthLoginTab = {
  COMPANY: 'company',
  SCHOOL: 'school',
} as const;

export type AuthLoginTab = (typeof AuthLoginTab)[keyof typeof AuthLoginTab];

// ─── Domain models ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  email?: string;
  phone_number?: string;
  role: Role;
  school_id?: string;
  profile_image?: string | null;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  code?: string;
  contact_number?: string | null;
  dial_code?: string;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  pincode?: string | null;
  logo_url?: string | null;
  board_type?: string | null;
  marking_system?: string | null;
  lat?: number | null;
  lng?: number | null;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: string;
}

// ─── Academic Year ─────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at?: string | null;
}

// ─── Class ────────────────────────────────────────────────────────────────────

export interface Class {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: string;
  numeric_value?: number | null;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface Section {
  id: string;
  school_id: string;
  class_id: string;
  name: string;
  room_number?: string | null;
  max_strength?: number | null;
  class_teacher_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Subject ──────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  school_id: string;
  class_id?: string | null;
  name: string;
  code?: string | null;
  description?: string | null;
  created_at: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'DROPPED';

export interface Student {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string | null;
  admission_number: string;
  roll_number?: string | null;
  first_name: string;
  last_name?: string | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  blood_group?: BloodGroup | null;
  email?: string | null;
  phone_number?: string | null;
  dial_code?: string;
  aadhaar_number?: string | null;
  religion?: string | null;
  caste?: string | null;
  nationality?: string;
  admission_date?: string | null;
  status: StudentStatus;
  profile_image?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Parent ───────────────────────────────────────────────────────────────────

export type ParentRelation = 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'GRANDPARENT' | 'SIBLING' | 'OTHER';

export interface Parent {
  id: string;
  student_id: string;
  relation: ParentRelation;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone_number: string;
  dial_code: string;
  occupation?: string | null;
  annual_income?: number | null;
  aadhaar_number?: string | null;
  is_primary: boolean;
  can_pickup: boolean;
  created_at: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
export type PlanType = 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'TRIAL';

export interface Subscription {
  id: string;
  school_id: string;
  plan_name: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  amount: string;
  currency: string;
  max_students?: number | null;
  max_staff?: number | null;
  features?: string[] | null;
  start_date?: string | null;
  end_date?: string | null;
  trial_end_date?: string | null;
  is_trial: boolean;
  auto_renew: boolean;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: string;
}

// ─── API Gateway types ─────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface ApiGatewayConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions<D = unknown> extends AxiosRequestConfig<D> {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export type GatewayResponse<T> = ApiEnvelope<T>;

export type RefreshTokenFn = () => Promise<{ accessToken: string; refreshToken: string }>;

export type { AxiosRequestConfig };
