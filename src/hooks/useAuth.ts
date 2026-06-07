'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { AuthContext } from '@/types';
import { AuthService, type LoginCompanyPayload, type LoginSchoolPayload, type SchoolSignupPayload } from '@/services/auth.service';
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

  async function switchSchool(schoolId: string) {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.switchSchool(schoolId);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
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
    setIsLoading(true);
    try {
      await AuthService.logout();
    } finally {
      clearAuth();
      setIsLoading(false);
      router.replace(ROUTES.login);
    }
  }

  async function signup(payload: SchoolSignupPayload) {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.schoolSignup(payload);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
      router.replace(ROUTES.schoolDashboard);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { loginCompany, loginSchool, switchSchool, logout, signup, isLoading, error };
}
