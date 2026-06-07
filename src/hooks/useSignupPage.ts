'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { schoolSignupSchema, type SchoolSignupFormValues } from '@/lib/validations/auth.validation';
import { useAuth } from './useAuth';

export function useSignupPage() {
  const { signup, isLoading } = useAuth();

  const form = useForm<SchoolSignupFormValues>({
    resolver: zodResolver(schoolSignupSchema) as any,
    defaultValues: {
      school_name: '',
      school_code: '',
      board_type: '',
      first_name: '',
      last_name: '',
      dial_code: '+91',
      phone_number: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: SchoolSignupFormValues) {
    try {
      await signup({
        school_name: values.school_name,
        school_code: values.school_code || undefined,
        board_type: values.board_type || undefined,
        first_name: values.first_name,
        last_name: values.last_name || undefined,
        dial_code: values.dial_code,
        phone_number: values.phone_number,
        email: values.email || undefined,
        password: values.password,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
    }
  }

  return { form, onSubmit, isLoading };
}
