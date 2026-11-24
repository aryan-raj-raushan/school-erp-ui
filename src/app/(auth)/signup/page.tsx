'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, BadgeCheck, Clock3, MailCheck } from 'lucide-react';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { useSignupPage } from '@/hooks/useSignupPage';
import type { OtpVerification } from '@/hooks/useOtpVerification';
import { ROUTES, REGEX } from '@/constants';
import { BOARD_TYPE_OPTIONS, MARKING_SYSTEM_OPTIONS } from '@/constants/school-profile.constants';
import {
  Div,
  Button,
  Input,
  Textarea,
  FormField,
  PhoneField,
  ResponsiveSelect,
  AuthCard,
  AuthNotice,
  LegalLinks,
  OtpInput,
  OtpDisplay,
} from '@/components/ui';
import { cn } from '@/lib/utils';

const inputClass = 'h-11 rounded-xl';

export default function SignupPage() {
  const vm = useSignupPage();
  useSwipeBack(ROUTES.login);

  if (vm.registered) {
    return <RegistrationReceived schoolName={vm.registered.school_name} code={vm.registered.school_code} />;
  }

  return (
    <AuthCard
      title="Register your school"
      subtitle="Takes about two minutes. We review every new school before it goes live."
    >
      <StepIndicator step={vm.step} />
      {vm.formError && <AuthNotice tone="error">{vm.formError}</AuthNotice>}
      <form onSubmit={vm.form.handleSubmit(vm.onSubmit)} noValidate>
        {vm.step === 'school' ? <SchoolStep vm={vm} /> : <AdminStep vm={vm} />}
      </form>
      <Div type="row" justify="center">
        <Link href={ROUTES.login} className="text-sm text-muted-foreground hover:underline">
          Already registered? <span className="font-semibold text-foreground">Sign in</span>
        </Link>
      </Div>
      <LegalLinks />
    </AuthCard>
  );
}

function StepIndicator({ step }: { step: 'school' | 'admin' }) {
  const steps = [
    { key: 'school', label: 'School details' },
    { key: 'admin', label: 'Admin & verification' },
  ] as const;
  const activeIndex = steps.findIndex((s) => s.key === step);
  return (
    <ol className="grid grid-cols-2 gap-2">
      {steps.map((s, index) => (
        <li key={s.key} className="flex flex-col gap-1.5">
          <span className={cn('h-1.5 rounded-full', index <= activeIndex ? 'bg-primary' : 'bg-muted')} />
          <span className={cn('text-xs font-medium', index === activeIndex ? 'text-foreground' : 'text-muted-foreground')}>
            {index + 1}. {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

type SignupVm = ReturnType<typeof useSignupPage>;

function SchoolStep({ vm }: { vm: SignupVm }) {
  const { form } = vm;
  const errors = form.formState.errors;
  return (
    <Div type="col" gap="md">
      <FormField label="School name" required htmlFor="school_name" error={errors.school_name?.message}>
        <Input id="school_name" placeholder="Sunrise Public School" autoCapitalize="words" className={inputClass} {...form.register('school_name')} />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResponsiveSelect label="Board" options={BOARD_TYPE_OPTIONS} customPlaceholder="Select board" {...form.register('board_type')} />
        <ResponsiveSelect label="Marking system" options={MARKING_SYSTEM_OPTIONS} customPlaceholder="Select system" {...form.register('marking_system')} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="School phone" htmlFor="contact_number" error={errors.contact_number?.message}>
          <Input id="contact_number" type="tel" inputMode="numeric" maxLength={10} placeholder="Office number" className={inputClass} {...form.register('contact_number')} />
        </FormField>
        <FormField label="School email" htmlFor="school_email" error={errors.school_email?.message}>
          <Input id="school_email" type="email" autoCapitalize="none" placeholder="office@school.edu.in" className={inputClass} {...form.register('school_email')} />
        </FormField>
      </div>

      <FormField label="Website" htmlFor="website" error={errors.website?.message}>
        <Input id="website" type="url" autoCapitalize="none" placeholder="https://school.edu.in" className={inputClass} {...form.register('website')} />
      </FormField>

      <FormField label="Address" htmlFor="address" error={errors.address?.message}>
        <Textarea id="address" rows={2} placeholder="Building, street, area" {...form.register('address')} />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField
          label="Pincode"
          htmlFor="pincode"
          error={errors.pincode?.message ?? vm.pincode.lookupError}
          hint={vm.pincode.isLooking ? 'Looking up…' : undefined}
        >
          <Input
            id="pincode"
            inputMode="numeric"
            maxLength={6}
            placeholder="411001"
            className={inputClass}
            {...form.register('pincode', { onChange: (e) => void vm.pincode.lookup(e.target.value) })}
          />
        </FormField>
        <FormField label="City" htmlFor="city">
          <Input id="city" placeholder="City" className={inputClass} {...form.register('city')} />
        </FormField>
        <FormField label="State" htmlFor="state">
          <Input id="state" placeholder="State" className={inputClass} {...form.register('state')} />
        </FormField>
      </div>

      <Button type="button" fullWidth className="h-12 rounded-xl text-[15px]" onClick={() => void vm.next()}>
        Continue <ArrowRight size={16} />
      </Button>
    </Div>
  );
}

function AdminStep({ vm }: { vm: SignupVm }) {
  const { form, phoneOtp, emailOtp } = vm;
  const errors = form.formState.errors;
  const phoneValid = REGEX.phoneIn.test(form.watch('phone_number') ?? '');
  const emailValid = REGEX.email.test(form.watch('email') ?? '');
  const canSubmit = !!phoneOtp.token && (!vm.hasEmail || !!emailOtp.token);

  return (
    <Div type="col" gap="md">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First name" required htmlFor="first_name" error={errors.first_name?.message}>
          <Input id="first_name" placeholder="Rahul" className={inputClass} {...form.register('first_name')} />
        </FormField>
        <FormField label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
          <Input id="last_name" placeholder="Sharma" className={inputClass} {...form.register('last_name')} />
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <PhoneField
            label="Mobile number (used to sign in)"
            required
            className="min-w-0 flex-1"
            dialCodeProps={form.register('dial_code')}
            phoneProps={form.register('phone_number')}
            phoneError={errors.phone_number?.message}
          />
          <VerifyButton otp={phoneOtp} enabled={phoneValid} />
        </div>
        <OtpPanel otp={phoneOtp} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <FormField label="Email (optional)" htmlFor="email" error={errors.email?.message} className="min-w-0 flex-1">
            <Input id="email" type="email" autoCapitalize="none" placeholder="you@school.edu.in" className={inputClass} {...form.register('email')} />
          </FormField>
          {vm.hasEmail && <VerifyButton otp={emailOtp} enabled={emailValid} />}
        </div>
        {vm.hasEmail && <OtpPanel otp={emailOtp} />}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Password" required htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" className={inputClass} {...form.register('password')} />
        </FormField>
        <FormField label="Confirm password" required htmlFor="confirm_password" error={errors.confirm_password?.message}>
          <Input id="confirm_password" type="password" autoComplete="new-password" placeholder="Repeat password" className={inputClass} {...form.register('confirm_password')} />
        </FormField>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={() => vm.setStep('school')}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Button type="submit" loading={vm.isLoading} disabled={!canSubmit} className="h-12 flex-1 rounded-xl text-[15px]">
          Submit for approval
        </Button>
      </div>
      {!canSubmit && (
        <p className="text-center text-xs text-muted-foreground">
          Verify your mobile number{vm.hasEmail ? ' and email' : ''} to continue.
        </p>
      )}
    </Div>
  );
}

function VerifyButton({ otp, enabled }: { otp: OtpVerification; enabled: boolean }) {
  if (otp.status === 'verified') {
    return (
      <span className="mb-0.5 inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
        <BadgeCheck size={16} /> Verified
      </span>
    );
  }
  return (
    <Button
      type="button"
      variant="outline"
      className="mb-0.5 h-11 shrink-0 rounded-xl"
      disabled={!enabled || otp.cooldown > 0}
      loading={otp.isSending}
      onClick={() => void otp.send()}
    >
      {otp.status === 'sent' ? (otp.cooldown > 0 ? `Resend ${otp.cooldown}s` : 'Resend') : 'Send code'}
    </Button>
  );
}

function OtpPanel({ otp }: { otp: OtpVerification }) {
  if (otp.status === 'verified') return null;
  if (otp.status === 'idle') {
    return otp.error ? <p className="text-xs font-medium text-rose-600">{otp.error}</p> : null;
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">
        Enter the 6-digit code for <span className="font-semibold text-foreground">{otp.sentTo}</span>
      </p>
      <OtpDisplay code={otp.displayCode} />
      <OtpInput
        value={otp.code}
        onChange={otp.setCode}
        onComplete={(code) => void otp.verify(code)}
        disabled={otp.isVerifying}
        invalid={!!otp.error}
        autoFocus
      />
      {otp.error && <p className="text-xs font-medium text-rose-600">{otp.error}</p>}
    </div>
  );
}

function RegistrationReceived({ schoolName, code }: { schoolName: string; code: string | null }) {
  return (
    <Div type="col" gap="lg" className="items-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Clock3 size={30} />
      </span>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registration received</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{schoolName}</span> is registered and waiting for approval from
          our team. You can sign in as soon as it is approved.
        </p>
      </div>
      <div className="w-full rounded-2xl border border-border bg-muted/40 p-4 text-left text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <MailCheck size={16} className="text-primary" /> What happens next
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Our team reviews your school details.</li>
          <li>Once approved, sign in with your verified mobile number and password.</li>
          {code && (
            <li>
              Your school code is <span className="font-semibold text-foreground">{code}</span>.
            </li>
          )}
        </ul>
      </div>
      <Link href={ROUTES.login} className="w-full">
        <Button type="button" fullWidth className="h-12 rounded-xl">
          Go to sign in
        </Button>
      </Link>
    </Div>
  );
}
