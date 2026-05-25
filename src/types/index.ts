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
  last_name: string;
  email?: string;
  phone_number?: string;
  role: Role;
  school_id?: string;
  profile_image?: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  code?: string;
  contact_number?: string;
  dial_code?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logo_url?: string;
  board_type?: string;
  marking_system?: string;
  lat?: number;
  lng?: number;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}
