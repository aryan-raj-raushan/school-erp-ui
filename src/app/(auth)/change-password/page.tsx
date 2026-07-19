'use client';

import { Suspense } from 'react';
import { useChangePasswordPage } from '@/hooks/useChangePasswordPage';
import { Div, Button, Input, FormField, AuthCard } from '@/components/ui';

function ChangePasswordForm() {
  const { form, onSubmit, isLoading } = useChangePasswordPage();

  return (
    <AuthCard title="Set a new password" subtitle="This was your first login — choose a new password to continue">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Div type="col" gap="md">
          <input type="hidden" {...form.register('change_token')} />

          <FormField
            label="New Password"
            htmlFor="password"
            error={form.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...form.register('password')}
            />
          </FormField>

          <FormField
            label="Confirm Password"
            htmlFor="confirm_password"
            error={form.formState.errors.confirm_password?.message}
          >
            <Input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...form.register('confirm_password')}
            />
          </FormField>

          <Button type="submit" loading={isLoading} fullWidth>
            Change Password
          </Button>
        </Div>
      </form>
    </AuthCard>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={null}>
      <ChangePasswordForm />
    </Suspense>
  );
}
