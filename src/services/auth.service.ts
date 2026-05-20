/**
 * services/auth.service.ts
 *
 * Domain-level wrapper for all authentication endpoints.
 * Keeps API URLs in one place and maps raw responses to clean DTOs.
 */

import { apiGateway } from "@/lib/api-gateway/api-gateway.instance"; 
import { TokenStorage, AuthContext } from '@/lib/api-gateway/token.storage';

// ─── Request / Response types (mirror backend DTOs) ──────────────────────────

export interface RegisterCompanyPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginCompanyPayload {
  email: string;
  password: string;
}

export interface LoginSchoolPayload {
  phone_number: string;
  dial_code: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  context: AuthContext;
  schoolId?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  role: string;
  school_id?: string;
  profile_image?: string;
  created_at: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const AuthService = {
  async registerCompany(payload: RegisterCompanyPayload): Promise<AuthUser> {
    const res = await apiGateway.post<AuthUser>('/auth/company/register', payload, {
      skipAuth: true,
    });
    return res.data;
  },

  async loginCompany(payload: LoginCompanyPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>('/auth/company/login', payload, {
      skipAuth: true,
    });

    // Persist tokens immediately after a successful login
    TokenStorage.save(
      { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
      AuthContext.COMPANY,
    );

    return res.data;
  },

  async loginSchool(payload: LoginSchoolPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>('/auth/school/login', payload, {
      skipAuth: true,
    });

    TokenStorage.save(
      { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
      AuthContext.SCHOOL,
    );

    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiGateway.post('/auth/logout', {});
    } finally {
      // Always clear local storage even if the server call fails
      TokenStorage.clear();
    }
  },

  async getMe(): Promise<UserProfile> {
    const res = await apiGateway.get<UserProfile>('/auth/me');
    return res.data;
  },
};