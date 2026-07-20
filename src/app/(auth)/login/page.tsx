'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLoginPage } from '@/hooks/useLoginPage';
import { useParentLoginForm } from '@/hooks/useParentLoginForm';
import { ROUTES } from '@/constants';
import { Div, Button, Input, FormField, AuthCard, AuthOrSeparator, SocialButtonGroup } from '@/components/ui';

type LoginMode = 'staff' | 'parent';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('staff');
  const staffLogin = useLoginPage();
  const parentLogin = useParentLoginForm();

  return (
    <AuthCard
      title="Welcome back"
      subtitle={mode === 'staff' ? 'Sign in to your school account' : "Sign in with your child's school account"}
    >
      <Div type="row" gap="sm" className="mb-4 rounded-[8px] bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode('staff')}
          className={`flex-1 rounded-[6px] py-1.5 text-sm font-medium transition-colors ${mode === 'staff' ? 'bg-white text-foreground shadow-sm dark:bg-white/10' : 'text-muted-foreground'}`}
        >
          School Staff
        </button>
        <button
          type="button"
          onClick={() => setMode('parent')}
          className={`flex-1 rounded-[6px] py-1.5 text-sm font-medium transition-colors ${mode === 'parent' ? 'bg-white text-foreground shadow-sm dark:bg-white/10' : 'text-muted-foreground'}`}
        >
          Parent
        </button>
      </Div>

      {mode === 'staff' ? (
        <StaffLoginForm {...staffLogin} />
      ) : (
        <ParentLoginForm {...parentLogin} />
      )}
    </AuthCard>
  );
}

function StaffLoginForm({
  form,
  onSubmit,
  isLoading,
  isPhone,
}: ReturnType<typeof useLoginPage>) {
  return (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Div type="col" gap="md">
          <SocialButtonGroup />

          <AuthOrSeparator />

          <FormField
            label="Email or Phone Number"
            htmlFor="identifier"
            error={form.formState.errors.identifier?.message ?? form.formState.errors.dial_code?.message}
          >
            <div className="flex h-11 items-center rounded-[8px] border border-border bg-white/70 backdrop-blur-sm transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring dark:bg-white/5">
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
                placeholder="you@school.com or 9876543210"
                autoComplete="username"
                maxLength={isPhone ? 10 : undefined}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                {...form.register('identifier')}
              />
            </div>
          </FormField>

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
  );
}

function ParentLoginForm({
  form,
  onSubmit,
  isLoading,
}: ReturnType<typeof useParentLoginForm>) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Div type="col" gap="md">
        <FormField
          label="Phone Number"
          htmlFor="parent-phone"
          error={form.formState.errors.phone_number?.message ?? form.formState.errors.dial_code?.message}
        >
          <div className="flex h-11 items-center rounded-[8px] border border-border bg-white/70 backdrop-blur-sm transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring dark:bg-white/5">
            <input
              id="parent-dial-code"
              type="text"
              placeholder="+91"
              aria-label="Dial code"
              className="h-full w-14 shrink-0 border-r border-border bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              {...form.register('dial_code')}
            />
            <input
              id="parent-phone"
              type="text"
              placeholder="9876543210"
              autoComplete="username"
              maxLength={10}
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              {...form.register('phone_number')}
            />
          </div>
        </FormField>

        <FormField
          label="Password"
          htmlFor="parent-password"
          error={form.formState.errors.password?.message}
        >
          <Input
            id="parent-password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...form.register('password')}
          />
        </FormField>

        <Button type="submit" loading={isLoading} fullWidth>
          Sign in
        </Button>
      </Div>
    </form>
  );
}
