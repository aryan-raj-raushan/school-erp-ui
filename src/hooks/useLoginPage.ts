'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { REGEX } from '@/constants';
import { unifiedLoginSchema, type UnifiedLoginFormValues } from '@/lib/validations/auth.validation';
import { useAuth } from './useAuth';

export function useLoginPage() {
  const { loginCompany, loginSchool, isLoading } = useAuth();

  const form = useForm<UnifiedLoginFormValues>({
    resolver: zodResolver(unifiedLoginSchema),
    defaultValues: { identifier: '', dial_code: '+91', password: '' },
  });

  const identifier = form.watch('identifier');
  const isPhone = !identifier.trim().includes('@');

  async function onSubmit(values: UnifiedLoginFormValues) {
    try {
      if (REGEX.email.test(values.identifier.trim())) {
        await loginCompany({ email: values.identifier.trim().toLowerCase(), password: values.password });
      } else {
        await loginSchool({
          phone_number: values.identifier.trim(),
          dial_code: values.dial_code ?? '+91',
          password: values.password,
        });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return { form, onSubmit, isLoading, isPhone };
}
