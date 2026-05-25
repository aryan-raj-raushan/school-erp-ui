import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { TokenStorage } from '@/lib/api-gateway/token.storage';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import { AuthContext, type Role, type UserProfile } from '@/types';

export interface RegisterCompanyPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: Role;
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
  role: Role;
  context: AuthContext;
  schoolId?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type { UserProfile };

export const AuthService = {
  async registerCompany(payload: RegisterCompanyPayload): Promise<AuthUser> {
    const res = await apiGateway.post<AuthUser>(ENDPOINTS.auth.companyRegister, payload, { skipAuth: true });
    return res.data;
  },

  async loginCompany(payload: LoginCompanyPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.companyLogin, payload, { skipAuth: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.COMPANY);
    return res.data;
  },

  async loginSchool(payload: LoginSchoolPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.schoolLogin, payload, { skipAuth: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.SCHOOL);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiGateway.post(ENDPOINTS.auth.logout, {});
    } finally {
      TokenStorage.clear();
    }
  },

  async getMe(): Promise<UserProfile> {
    const res = await apiGateway.get<UserProfile>(ENDPOINTS.auth.me);
    return res.data;
  },
};
