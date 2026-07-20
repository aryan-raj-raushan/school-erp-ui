'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { parentLoginSchema, type ParentLoginFormValues } from '@/lib/validations/auth.validation';
import { useAuth } from './useAuth';

export function useParentLoginForm() {
  const { loginParent, isLoading } = useAuth();

  const form = useForm<ParentLoginFormValues>({
    resolver: zodResolver(parentLoginSchema),
    defaultValues: { dial_code: '+91', phone_number: '', password: '' },
  });

  async function onSubmit(values: ParentLoginFormValues) {
    try {
      await loginParent(values);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return { form, onSubmit, isLoading };
}
