'use client';

import { AUTH_TABS, COMPANY_LOGIN_FORM, SCHOOL_LOGIN_FORM } from '@/constants';
import { AuthLoginTab } from '@/types';
import { useLoginPage } from '@/hooks/useLoginPage';
import { Div, Label, ErrorText, Button, Input, Tabs, FormField } from '@/components/ui';

export default function LoginPage() {
  const { tab, setTab, companyForm, schoolForm, submitCompany, submitSchool, isLoading } = useLoginPage();

  return (
    <Div type="col" gap="lg">
      <Tabs options={AUTH_TABS} value={tab} onChange={setTab} />

      {tab === AuthLoginTab.COMPANY ? (
        <form onSubmit={companyForm.handleSubmit(submitCompany)}>
          <Div type="col" gap="md">
            <FormField
              label={COMPANY_LOGIN_FORM.labels.email}
              htmlFor="email"
              error={companyForm.formState.errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder={COMPANY_LOGIN_FORM.placeholders.email}
                {...companyForm.register('email')}
              />
            </FormField>
            <FormField
              label={COMPANY_LOGIN_FORM.labels.password}
              htmlFor="password"
              error={companyForm.formState.errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                placeholder={COMPANY_LOGIN_FORM.placeholders.password}
                {...companyForm.register('password')}
              />
            </FormField>
            <Button type="submit" loading={isLoading} fullWidth>
              {COMPANY_LOGIN_FORM.submit.idle}
            </Button>
          </Div>
        </form>
      ) : (
        <form onSubmit={schoolForm.handleSubmit(submitSchool)}>
          <Div type="col" gap="md">
            <Div type="col" gap="xs">
              <Label>{SCHOOL_LOGIN_FORM.labels.phone}</Label>
              <Div type="row" gap="sm">
                <Input
                  width="xs"
                  placeholder={SCHOOL_LOGIN_FORM.placeholders.dialCode}
                  {...schoolForm.register('dial_code')}
                />
                <Input
                  type="tel"
                  placeholder={SCHOOL_LOGIN_FORM.placeholders.phone}
                  {...schoolForm.register('phone_number')}
                />
              </Div>
              {(schoolForm.formState.errors.dial_code || schoolForm.formState.errors.phone_number) && (
                <ErrorText>
                  {schoolForm.formState.errors.dial_code?.message ??
                    schoolForm.formState.errors.phone_number?.message}
                </ErrorText>
              )}
            </Div>
            <FormField
              label={SCHOOL_LOGIN_FORM.labels.password}
              htmlFor="school-password"
              error={schoolForm.formState.errors.password?.message}
            >
              <Input
                id="school-password"
                type="password"
                placeholder={SCHOOL_LOGIN_FORM.placeholders.password}
                {...schoolForm.register('password')}
              />
            </FormField>
            <Button type="submit" loading={isLoading} fullWidth>
              {SCHOOL_LOGIN_FORM.submit.idle}
            </Button>
          </Div>
        </form>
      )}
    </Div>
  );
}
