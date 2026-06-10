'use client';

import Link from 'next/link';
import { useLoginPage } from '@/hooks/useLoginPage';
import { ROUTES } from '@/constants';
import { Div, Button, Input, FormField, AuthCard, AuthOrSeparator, SocialButtonGroup } from '@/components/ui';

export default function LoginPage() {
  const { form, onSubmit, isLoading, isPhone } = useLoginPage();

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your school account">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Div type="col" gap="md">
          <SocialButtonGroup />

          <AuthOrSeparator />

          <FormField
            label="Email or Phone Number"
            htmlFor="identifier"
            error={form.formState.errors.identifier?.message}
          >
            <Input
              id="identifier"
              type="text"
              placeholder="you@school.com or 9876543210"
              autoComplete="username"
              {...form.register('identifier')}
            />
          </FormField>

          {isPhone && (
            <FormField
              label="Dial Code"
              htmlFor="dial_code"
              error={form.formState.errors.dial_code?.message}
            >
              <Input
                id="dial_code"
                type="text"
                placeholder="+91"
                width="xs"
                {...form.register('dial_code')}
              />
            </FormField>
          )}

          <FormField
            label="Password"
            htmlFor="password"
            error={form.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...form.register('password')}
            />
          </FormField>

          <Button type="submit" loading={isLoading} fullWidth>
            Sign in
          </Button>

          <Div type="row" justify="center">
            <Link href={ROUTES.signup} className="text-sm text-muted-foreground hover:underline">
              Don&apos;t have an account? Sign up
            </Link>
          </Div>
        </Div>
      </form>
    </AuthCard>
  );
}
