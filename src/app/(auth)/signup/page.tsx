'use client';

import Link from 'next/link';
import { useSignupPage } from '@/hooks/useSignupPage';
import { ROUTES } from '@/constants';
import { Div, Button, Input, FormField, PhoneField, AuthCard, AuthOrSeparator, SocialButtonGroup } from '@/components/ui';

export default function SignupPage() {
  const { form, onSubmit, isLoading } = useSignupPage();

  return (
    <AuthCard title="Create your account" subtitle="Set up your school on the ERP platform">
      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        <Div type="col" gap="sm">
          <SocialButtonGroup />

          <AuthOrSeparator />

          <FormField
            label="School Name"
            htmlFor="school_name"
            error={form.formState.errors.school_name?.message}
          >
            <Input
              id="school_name"
              type="text"
              placeholder="Sunrise Public School"
              {...form.register('school_name')}
            />
          </FormField>

          <Div type="grid" cols={2} gap="md">
            <FormField
              label="First Name"
              htmlFor="first_name"
              error={form.formState.errors.first_name?.message}
            >
              <Input
                id="first_name"
                type="text"
                placeholder="John"
                {...form.register('first_name')}
              />
            </FormField>

            <FormField
              label="Last Name (optional)"
              htmlFor="last_name"
              error={form.formState.errors.last_name?.message}
            >
              <Input
                id="last_name"
                type="text"
                placeholder="Doe"
                {...form.register('last_name')}
              />
            </FormField>
          </Div>

          <PhoneField
            dialCodeProps={form.register('dial_code')}
            phoneProps={form.register('phone_number')}
            phoneError={form.formState.errors.phone_number?.message}
          />

          <FormField
            label="Email (optional)"
            htmlFor="email"
            error={form.formState.errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="admin@school.com"
              {...form.register('email')}
            />
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
              autoComplete="new-password"
              {...form.register('password')}
            />
          </FormField>

          <Button type="submit" loading={isLoading} fullWidth>
            Create Account
          </Button>

          <Div type="row" justify="center">
            <Link href={ROUTES.login} className="text-sm text-muted-foreground hover:underline">
              Already have an account? Sign in
            </Link>
          </Div>
        </Div>
      </form>
    </AuthCard>
  );
}
