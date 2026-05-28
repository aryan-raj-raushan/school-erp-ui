'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AuthLoginTab } from '@/types';
import {
  companyLoginSchema,
  schoolLoginSchema,
  type CompanyLoginFormValues,
  type SchoolLoginFormValues,
} from '@/lib/validations/auth.validation';
import { useAuth } from './useAuth';

export function useLoginPage() {
  const [tab, setTab] = useState<AuthLoginTab>(AuthLoginTab.COMPANY);
  const { loginCompany, loginSchool, isLoading, error } = useAuth();

  const companyForm = useForm<CompanyLoginFormValues>({
    resolver: zodResolver(companyLoginSchema),
  });

  const schoolForm = useForm<SchoolLoginFormValues>({
    resolver: zodResolver(schoolLoginSchema),
  });

  async function submitCompany(values: CompanyLoginFormValues) {
    try {
      await loginCompany(values);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  async function submitSchool(values: SchoolLoginFormValues) {
    try {
      await loginSchool(values);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return {
    tab,
    setTab,
    companyForm,
    schoolForm,
    submitCompany,
    submitSchool,
    isLoading,
    error,
  };
}
