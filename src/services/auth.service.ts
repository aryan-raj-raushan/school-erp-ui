import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { TokenStorage } from '@/lib/api-gateway/token.storage';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import { AuthContext, type Role, type UserProfile } from '@/types';

export interface ConfirmProfilePayload {
  first_name: string;
  last_name?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  address?: string;
  city?: string;
  alternate_phone?: string;
  occupation?: string;
}

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

export interface LoginParentPayload {
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
  board_type?: string;
  marking_system?: string;
  contact_number?: string;
  school_email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  first_name: string;
  last_name?: string;
  dial_code?: string;
  phone_number: string;
  email?: string;
  password: string;
  phone_verification_token: string;
  email_verification_token?: string;
}

export interface SchoolSignupPending {
  status: 'PENDING_APPROVAL';
  school_id: string;
  school_name: string;
  school_code: string | null;
}

export type OtpChannel = 'PHONE' | 'EMAIL';

export interface OtpTargetPayload {
  channel: OtpChannel;
  purpose: 'SIGNUP';
  dial_code?: string;
  phone_number?: string;
  email?: string;
}

export interface OtpDispatch {
  channel: OtpChannel;
  sent_to: string;
  expires_in: number;
  resend_in: number;
  display_code?: string;
}

export interface PhoneVerificationRequired {
  phone_verification_required: true;
  verification_token: string;
  sent_to: string;
  resend_in: number;
  display_code?: string;
  context: 'SCHOOL' | 'PARENT';
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

export interface PasswordChangeRequired {
  must_change_password: true;
  change_token: string;
  context: 'SCHOOL' | 'PARENT';
}

export type LoginOrChangeResult = LoginResult | PasswordChangeRequired | PhoneVerificationRequired;
export type LoginParentResult = LoginResult | PasswordChangeRequired | PhoneVerificationRequired;

export function isLoginResult(result: LoginOrChangeResult): result is LoginResult {
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

  async loginParent(payload: LoginParentPayload): Promise<LoginParentResult> {
    const res = await apiGateway.post<LoginParentResult>(ENDPOINTS.auth.parentLogin, payload, { skipAuth: true, skipRefresh: true });
    if (isLoginResult(res.data)) {
      TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.PARENT);
    }
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

  async confirmProfile(payload: ConfirmProfilePayload): Promise<UserProfile> {
    const res = await apiGateway.patch<UserProfile>(ENDPOINTS.auth.meProfile, payload);
    return res.data;
  },

  async switchSchool(schoolId: string): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.switchSchool(schoolId), {});
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.SCHOOL);
    return res.data;
  },

  async switchStudent(studentId: string): Promise<LoginParentResult> {
    const res = await apiGateway.post<LoginParentResult>(ENDPOINTS.auth.switchStudent(studentId), {});
    if (isLoginResult(res.data)) {
      TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.PARENT);
    }
    return res.data;
  },

  async schoolSignup(payload: SchoolSignupPayload): Promise<SchoolSignupPending> {
    const res = await apiGateway.post<SchoolSignupPending>(ENDPOINTS.auth.schoolSignup, payload, { skipAuth: true, skipRefresh: true });
    return res.data;
  },

  async sendOtp(payload: OtpTargetPayload): Promise<OtpDispatch> {
    const res = await apiGateway.post<OtpDispatch>(ENDPOINTS.auth.otpSend, payload, { skipAuth: true, skipRefresh: true });
    return res.data;
  },

  async verifyOtp(payload: OtpTargetPayload & { otp: string }): Promise<{ verification_token: string }> {
    const res = await apiGateway.post<{ verification_token: string }>(ENDPOINTS.auth.otpVerify, payload, { skipAuth: true, skipRefresh: true });
    return res.data;
  },

  async verifyPhoneLogin(verification_token: string, otp: string): Promise<LoginOrChangeResult> {
    const res = await apiGateway.post<LoginOrChangeResult>(ENDPOINTS.auth.verifyPhone, { verification_token, otp }, { skipAuth: true, skipRefresh: true });
    if (isLoginResult(res.data)) {
      TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, res.data.user.context);
    }
    return res.data;
  },

  async resendPhoneOtp(verification_token: string): Promise<OtpDispatch> {
    const res = await apiGateway.post<OtpDispatch>(ENDPOINTS.auth.verifyPhoneResend, { verification_token }, { skipAuth: true, skipRefresh: true });
    return res.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.changePassword, payload, { skipAuth: true, skipRefresh: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.SCHOOL);
    return res.data;
  },

  async changePasswordParent(payload: ChangePasswordPayload): Promise<LoginResult> {
    const res = await apiGateway.post<LoginResult>(ENDPOINTS.auth.parentChangePassword, payload, { skipAuth: true, skipRefresh: true });
    TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, AuthContext.PARENT);
    return res.data;
  },

  async loginUnified(payload: LoginUnifiedPayload): Promise<LoginOrChangeResult> {
    const res = await apiGateway.post<LoginOrChangeResult>(ENDPOINTS.auth.login, payload, { skipAuth: true, skipRefresh: true });
    if (isLoginResult(res.data)) {
      const context = res.data.user.context;
      TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, context);
    }
    return res.data;
  },

  async loginSocial(token: string): Promise<LoginOrChangeResult> {
    const res = await apiGateway.post<LoginOrChangeResult>(ENDPOINTS.auth.socialLogin, { token }, { skipAuth: true, skipRefresh: true });
    if (isLoginResult(res.data)) {
      TokenStorage.save({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, res.data.user.context);
    }
    return res.data;
  },
};
