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
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validations/auth.validation';

export function useChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setPermissions } = useAuthStore();
  const changeToken = searchParams.get('token') ?? '';
  const isParent = searchParams.get('ctx') === 'parent';

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      change_token: changeToken,
      password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (changeToken) {
      form.setValue('change_token', changeToken);
    }
  }, [changeToken, form]);

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      const payload = {
        change_token: values.change_token,
        password: values.password,
        confirm_password: values.confirm_password,
      };

      if (isParent) {
        await AuthService.changePasswordParent(payload);
        const profile = await AuthService.getMe();
        setAuth(profile, AuthContext.PARENT);
        setPermissions(profile.permissions ?? []);
        toast.success('Password changed successfully');
        router.replace(ROUTES.parentPortal);
        return;
      }

      await AuthService.changePassword(payload);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
      setPermissions(profile.permissions ?? []);
      toast.success('Password changed successfully');
      router.replace(ROUTES.schoolDashboard);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    }
  }

  return { form, onSubmit, isLoading: form.formState.isSubmitting, changeToken };
}
