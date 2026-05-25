'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { COMPANY_LOGIN_FORM } from '@/constants';
import { companyLoginSchema, type CompanyLoginFormValues } from '@/lib/validations/auth.validation';
import { useAuth } from '@/hooks/useAuth';

export function CompanyLoginForm() {
  const { loginCompany, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyLoginFormValues>({
    resolver: zodResolver(companyLoginSchema),
  });

  async function onSubmit(values: CompanyLoginFormValues) {
    try {
      await loginCompany(values);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {COMPANY_LOGIN_FORM.labels.email}
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder={COMPANY_LOGIN_FORM.placeholders.email}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {COMPANY_LOGIN_FORM.labels.password}
        </label>
        <input
          {...register('password')}
          type="password"
          placeholder={COMPANY_LOGIN_FORM.placeholders.password}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? COMPANY_LOGIN_FORM.submit.loading : COMPANY_LOGIN_FORM.submit.idle}
      </button>
    </form>
  );
}
