'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ROUTES } from '@/constants';
import { AuthContext } from '@/types';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { setupPasswordSchema, type SetupPasswordFormValues } from '@/lib/validations/auth.validation';

export function useSetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const setupToken = searchParams.get('token') ?? '';

  const form = useForm<SetupPasswordFormValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: {
      setup_token: setupToken,
      password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (setupToken) {
      form.setValue('setup_token', setupToken);
    }
  }, [setupToken, form]);

  async function onSubmit(values: SetupPasswordFormValues) {
    try {
      await AuthService.setupPassword({
        setup_token: values.setup_token,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
      toast.success('Password set successfully');
      router.replace(ROUTES.schoolDashboard);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to set password');
    }
  }

  return { form, onSubmit, isLoading: form.formState.isSubmitting, setupToken };
}
