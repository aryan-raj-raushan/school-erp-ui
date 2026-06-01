'use client';

import { useLoginPage } from '@/hooks/useLoginPage';
import { Div, Label, ErrorText, Button, Input, FormField } from '@/components/ui';

export default function LoginPage() {
  const { form, onSubmit, isLoading, isPhone } = useLoginPage();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Div type="col" gap="md">
        <FormField
          label="Email or Phone Number"
          htmlFor="identifier"
          error={form.formState.errors.identifier?.message}
        >
          <Input
            id="identifier"
            type="text"
            placeholder="you@company.com or 9876543210"
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
      </Div>
    </form>
  );
}
