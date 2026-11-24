'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  schoolSignupSchema,
  SCHOOL_SIGNUP_STEP_FIELDS,
  type SchoolSignupFormValues,
} from '@/lib/validations/auth.validation';
import type { SchoolSignupPending } from '@/services/auth.service';
import { usePincodeLookup } from './usePincodeLookup';
import { useOtpVerification } from './useOtpVerification';
import { useAuth } from './useAuth';

export type SignupStep = 'school' | 'admin';

const blankToUndefined = (value?: string) => (value && value.trim() ? value.trim() : undefined);

export function useSignupPage() {
  const { signup, isLoading } = useAuth();
  const [step, setStep] = useState<SignupStep>('school');
  const [formError, setFormError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<SchoolSignupPending | null>(null);

  const form = useForm<SchoolSignupFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schoolSignupSchema) as never,
    defaultValues: {
      school_name: '',
      board_type: '',
      marking_system: '',
      contact_number: '',
      school_email: '',
      website: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      first_name: '',
      last_name: '',
      dial_code: '+91',
      phone_number: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const [dialCode, phone, email] = useWatch({ control: form.control, name: ['dial_code', 'phone_number', 'email'] });
  const phoneOtp = useOtpVerification('PHONE', { dial_code: dialCode, phone_number: phone });
  const emailOtp = useOtpVerification('EMAIL', { email });
  const hasEmail = !!email?.trim();

  const pincode = usePincodeLookup((details) => {
    form.setValue('city', details.city, { shouldDirty: true });
    form.setValue('state', details.state, { shouldDirty: true });
  });

  async function next() {
    const valid = await form.trigger([...SCHOOL_SIGNUP_STEP_FIELDS.school]);
    if (valid) setStep('admin');
  }

  async function onSubmit(values: SchoolSignupFormValues) {
    setFormError(null);
    if (!phoneOtp.token) {
      setFormError('Verify your mobile number with the code we send you.');
      return;
    }
    if (hasEmail && !emailOtp.token) {
      setFormError('Verify your email, or leave it empty to skip.');
      return;
    }
    try {
      const result = await signup({
        school_name: values.school_name.trim(),
        board_type: blankToUndefined(values.board_type),
        marking_system: blankToUndefined(values.marking_system),
        contact_number: blankToUndefined(values.contact_number),
        school_email: blankToUndefined(values.school_email),
        website: blankToUndefined(values.website),
        address: blankToUndefined(values.address),
        city: blankToUndefined(values.city),
        state: blankToUndefined(values.state),
        pincode: blankToUndefined(values.pincode),
        first_name: values.first_name.trim(),
        last_name: blankToUndefined(values.last_name),
        dial_code: values.dial_code,
        phone_number: values.phone_number,
        email: blankToUndefined(values.email),
        password: values.password,
        phone_verification_token: phoneOtp.token,
        email_verification_token: hasEmail ? emailOtp.token ?? undefined : undefined,
      });
      setRegistered(result);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Signup failed');
    }
  }

  return {
    form,
    step,
    setStep,
    next,
    onSubmit,
    isLoading,
    formError,
    registered,
    phoneOtp,
    emailOtp,
    hasEmail,
    pincode,
  };
}
