'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { REGEX } from '@/constants';
import { unifiedLoginSchema, type UnifiedLoginFormValues } from '@/lib/validations/auth.validation';
import { useAuth } from './useAuth';

export function useLoginPage() {
  const { loginUnified, isLoading } = useAuth();

  const form = useForm<UnifiedLoginFormValues>({
    resolver: zodResolver(unifiedLoginSchema),
    defaultValues: { identifier: '', dial_code: '+91', password: '' },
  });

  const identifier = form.watch('identifier');
  const trimmedIdentifier = identifier.trim();
  // Digits-only means the user is entering a phone number; anything else
  // (letters, @, .) means they're typing an email, even mid-entry.
  const isPhone = trimmedIdentifier.length > 0 && REGEX.digitsOnly.test(trimmedIdentifier);

  async function onSubmit(values: UnifiedLoginFormValues) {
    try {
      // Unified endpoint resolves company vs school users itself (by identifier),
      // and handles email OR phone for school users — see AuthService.loginUnified.
      await loginUnified({
        identifier: values.identifier.trim(),
        dial_code: values.dial_code ?? '+91',
        password: values.password,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return { form, onSubmit, isLoading, isPhone };
}
