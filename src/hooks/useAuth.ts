'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { AuthContext } from '@/types';
import { AuthService, type LoginCompanyPayload, type LoginSchoolPayload } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginCompany(payload: LoginCompanyPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthService.loginCompany(payload);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.COMPANY);
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

  async function logout() {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } finally {
      clearAuth();
      setIsLoading(false);
      router.replace(ROUTES.login);
    }
  }

  return { loginCompany, loginSchool, logout, isLoading, error };
}
