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

export interface SchoolSignupPayload {
  school_name: string;
  school_code?: string;
  board_type?: string;
  first_name: string;
  last_name?: string;
  dial_code?: string;
  phone_number: string;
  email?: string;
  password: string;
}

export interface SetupPasswordPayload {
  setup_token: string;
  password: string;
  confirm_password: string;
}

export interface ChangePasswordPayload {
  change_token: string;
  password: string;
  confirm_password: string;
}

export interface LoginUnifiedPayload {
  identifier: string;
  dial_code?: string;
  password: string;
}

export interface PasswordSetupRequired {
  needs_password_setup: true;
  setup_token: string;
}

export interface PasswordChangeRequired {
  must_change_password: true;
  change_token: string;
}

export type LoginOrSetupResult = LoginResult | PasswordSetupRequired | PasswordChangeRequired;

export function isLoginResult(result: LoginOrSetupResult): result is LoginResult {
  return 'accessToken' in result;
}

export type { UserProfile };

export const AuthService = {
  async registerCompany(payload: RegisterCompanyPayload): Promise<AuthUser> {
    const res = await apiGateway.post<AuthUser>(ENDPOINTS.auth.companyRegister, payload, { skipAuth: true, skipRefresh: true });
    return res.data;
  },

  async loginCompany(payload: LoginCompanyPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.companyLogin, payload, { skipAuth: true, skipRefresh: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.COMPANY);
    return res.data;
  },

  async loginSchool(payload: LoginSchoolPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.schoolLogin, payload, { skipAuth: true, skipRefresh: true });
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

  async switchSchool(schoolId: string): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.switchSchool(schoolId), {});
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.SCHOOL);
    return res.data;
  },

  async schoolSignup(payload: SchoolSignupPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.schoolSignup, payload, { skipAuth: true, skipRefresh: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.SCHOOL);
    return res.data;
  },

  async setupPassword(payload: SetupPasswordPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.setupPassword, payload, { skipAuth: true, skipRefresh: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.SCHOOL);
    return res.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.changePassword, payload, { skipAuth: true, skipRefresh: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.SCHOOL);
    return res.data;
  },

  async loginUnified(payload: LoginUnifiedPayload): Promise<LoginOrSetupResult> {
    const res = await apiGateway.post<LoginOrSetupResult>(ENDPOINTS.auth.login, payload, { skipAuth: true, skipRefresh: true });
    if (isLoginResult(res.data)) {
      const context = res.data.user.context;
      TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, context);
    }
    return res.data;
  },
};
