'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSetupPasswordPage } from '@/hooks/useSetupPasswordPage';
import { ROUTES } from '@/constants';
import { Div, Button, Input, FormField, AuthCard } from '@/components/ui';

function SetupPasswordForm() {
  const { form, onSubmit, isLoading } = useSetupPasswordPage();

  return (
    <AuthCard title="Set your password" subtitle="Choose a secure password for your account">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Div type="col" gap="md">
          <input type="hidden" {...form.register('setup_token')} />

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
            Set Password
          </Button>

          <Div type="row" justify="center">
            <Link href={ROUTES.login} className="text-sm text-muted-foreground hover:underline">
              Back to login
            </Link>
          </Div>
        </Div>
      </form>
    </AuthCard>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetupPasswordForm />
    </Suspense>
  );
}
