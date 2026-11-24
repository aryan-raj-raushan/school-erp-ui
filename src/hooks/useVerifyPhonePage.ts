'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { AuthService, type PhoneVerificationRequired } from '@/services/auth.service';
import { PhoneVerificationStorage } from '@/lib/phone-verification.storage';
import { errorMessage } from '@/lib/api-error';
import { useAuth } from './useAuth';

export function useVerifyPhonePage() {
  const router = useRouter();
  const { verifyPhone, isLoading } = useAuth();
  const [pending, setPending] = useState<PhoneVerificationRequired | null>(null);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [displayCode, setDisplayCode] = useState<string | undefined>();
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = PhoneVerificationStorage.read();
    if (!stored) {
      router.replace(ROUTES.login);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(stored);
    setCooldown(stored.resend_in);
    setDisplayCode(stored.display_code);
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function submit(otp: string) {
    if (!pending || otp.length !== 6) return;
    setError(null);
    try {
      await verifyPhone(pending.verification_token, otp);
    } catch (err) {
      setError(errorMessage(err, 'Incorrect code'));
      setCode('');
    }
  }

  async function resend() {
    if (!pending) return;
    setIsResending(true);
    setError(null);
    try {
      const dispatch = await AuthService.resendPhoneOtp(pending.verification_token);
      setCooldown(dispatch.resend_in);
      setDisplayCode(dispatch.display_code);
    } catch (err) {
      setError(errorMessage(err, 'Could not resend the code'));
    } finally {
      setIsResending(false);
    }
  }

  return { pending, code, setCode, displayCode, cooldown, isResending, isLoading, error, submit, resend };
}
