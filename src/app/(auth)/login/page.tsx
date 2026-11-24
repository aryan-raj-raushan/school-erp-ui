'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLoginPage } from '@/hooks/useLoginPage';
import { useSocialLogin } from '@/hooks/useSocialLogin';
import { ROUTES } from '@/constants';
import {
  Div,
  Button,
  Input,
  FormField,
  AuthCard,
  AuthNotice,
  AuthOrSeparator,
  SocialButtonGroup,
  LegalLinks,
} from '@/components/ui';

export default function LoginPage() {
  const login = useLoginPage();

  return (
    <AuthCard title="Welcome back 👋" subtitle="Sign in with your mobile number or email">
      <UnifiedLoginForm {...login} />
    </AuthCard>
  );
}

function UnifiedLoginForm({ form, onSubmit, isLoading, isPhone, formError }: ReturnType<typeof useLoginPage>) {
  const social = useSocialLogin();
  const isPendingApproval = !!formError && /waiting for approval/i.test(formError);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Div type="col" gap="md">
        {formError && (
          <AuthNotice tone={isPendingApproval ? 'warning' : 'error'}>
            {isPendingApproval && <strong className="mb-0.5 block">Registration under review</strong>}
            {formError}
          </AuthNotice>
        )}

        <FormField
          label="Mobile number or email"
          htmlFor="identifier"
          error={form.formState.errors.identifier?.message ?? form.formState.errors.dial_code?.message}
        >
          <div className="flex h-12 items-center rounded-xl border border-border bg-white transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
            {isPhone && (
              <input
                id="dial_code"
                type="text"
                placeholder="+91"
                aria-label="Dial code"
                className="h-full w-14 shrink-0 border-r border-border bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                {...form.register('dial_code')}
              />
            )}
            <input
              id="identifier"
              type="text"
              placeholder="9876543210 or you@school.com"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              maxLength={isPhone ? 10 : undefined}
              className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              {...form.register('identifier')}
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            className="h-12 rounded-xl"
            {...form.register('password')}
          />
        </FormField>

        <Button type="submit" loading={isLoading} fullWidth className="h-12 rounded-xl text-[15px]">
          Sign in <ArrowRight size={16} />
        </Button>

        {social.enabled && (
          <>
            <AuthOrSeparator />
            <SocialButtonGroup onSelect={social.signInWith} pendingProvider={social.pendingProvider} />
          </>
        )}

        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-center text-sm text-muted-foreground">
          New school?{' '}
          <Link href={ROUTES.signup} className="font-semibold text-foreground underline-offset-4 hover:underline">
            Register your school
          </Link>
        </div>

        <LegalLinks />
      </Div>
    </form>
  );
}
