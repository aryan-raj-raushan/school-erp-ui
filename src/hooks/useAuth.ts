'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { AuthContext } from '@/types';
import {
  AuthService,
  type LoginCompanyPayload,
  type LoginSchoolPayload,
  type LoginParentPayload,
  type LoginUnifiedPayload,
  type LoginOrChangeResult,
  type SchoolSignupPayload,
} from '@/services/auth.service';
import { TokenStorage } from '@/lib/api-gateway/token.storage';
import { ImpersonationStorage } from '@/lib/impersonation.storage';
import { useAuthStore } from '@/store/auth.store';
import { useParentStore } from '@/store/parent.store';
import { PhoneVerificationStorage } from '@/lib/phone-verification.storage';

const HOME_BY_CONTEXT: Record<AuthContext, string> = {
  [AuthContext.COMPANY]: ROUTES.dashboard,
  [AuthContext.SCHOOL]: ROUTES.schoolDashboard,
  [AuthContext.PARENT]: ROUTES.parentPortal,
};

export function useAuth() {
  const router = useRouter();
  const { setAuth, setPermissions, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function hydratePermissions(profile: { permissions?: string[] }) {
    setPermissions(profile.permissions ?? []);
  }

  async function loginCompany(payload: LoginCompanyPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthService.loginCompany(payload);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.COMPANY);
      hydratePermissions(profile);
      router.replace(ROUTES.dashboard);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function loginSchool(payload: LoginSchoolPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthService.loginSchool(payload);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
      hydratePermissions(profile);
      router.replace(ROUTES.schoolDashboard);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function loginParent(payload: LoginParentPayload) {
    setIsLoading(true);
    setError(null);
    try {
      return await finishLogin(await AuthService.loginParent(payload));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function finishLogin(result: LoginOrChangeResult) {
    if ('phone_verification_required' in result) {
      PhoneVerificationStorage.save(result);
      router.replace(ROUTES.verifyPhone);
      return result;
    }
    PhoneVerificationStorage.clear();
    if ('must_change_password' in result) {
      const ctxSuffix = result.context === AuthContext.PARENT ? '&ctx=parent' : '';
      router.replace(`${ROUTES.changePassword}?token=${result.change_token}${ctxSuffix}`);
      return result;
    }

    const profile = await AuthService.getMe();
    setAuth(profile, result.user.context);
    hydratePermissions(profile);
    router.replace(HOME_BY_CONTEXT[result.user.context]);
    return result;
  }

  async function loginUnified(payload: LoginUnifiedPayload) {
    setIsLoading(true);
    setError(null);
    try {
      return await finishLogin(await AuthService.loginUnified(payload));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function loginSocial(token: string) {
    setIsLoading(true);
    setError(null);
    try {
      return await finishLogin(await AuthService.loginSocial(token));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function switchSchool(schoolId: string) {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.switchSchool(schoolId);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
      hydratePermissions(profile);
      router.replace(ROUTES.schoolDashboard);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to switch school';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    // Exiting an impersonated School Admin session restores the Super Admin's own
    // session (still valid — switching schools never touched it) instead of a real
    // logout. A real logout only happens when there's no impersonation to unwind.
    const origin = ImpersonationStorage.read();
    if (origin) {
      ImpersonationStorage.clear();
      TokenStorage.save({ accessToken: origin.accessToken, refreshToken: origin.refreshToken }, origin.context);
      setAuth(origin.user, origin.context);
      setPermissions(origin.permissions);
      router.replace(ROUTES.dashboard);
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.logout();
    } finally {
      clearAuth();
      useParentStore.getState().clear();
      setIsLoading(false);
      router.replace(ROUTES.login);
    }
  }

  async function verifyPhone(verificationToken: string, otp: string) {
    setIsLoading(true);
    setError(null);
    try {
      return await finishLogin(await AuthService.verifyPhoneLogin(verificationToken, otp));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(payload: SchoolSignupPayload) {
    setIsLoading(true);
    setError(null);
    try {
      return await AuthService.schoolSignup(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { loginCompany, loginSchool, loginParent, loginUnified, loginSocial, verifyPhone, switchSchool, logout, signup, isLoading, error };
}
