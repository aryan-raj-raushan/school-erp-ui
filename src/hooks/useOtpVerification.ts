'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthService, type OtpChannel } from '@/services/auth.service';
import { errorMessage } from '@/lib/api-error';

type OtpStatus = 'idle' | 'sent' | 'verified';

interface OtpTarget {
  dial_code?: string;
  phone_number?: string;
  email?: string;
}

export function useOtpVerification(channel: OtpChannel, target: OtpTarget) {
  const targetKey = channel === 'PHONE' ? `${target.dial_code}${target.phone_number}` : (target.email ?? '').toLowerCase();
  const [verifiedFor, setVerifiedFor] = useState<string | null>(null);
  const [sentFor, setSentFor] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [displayCode, setDisplayCode] = useState<string | undefined>();
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status: OtpStatus = verifiedFor === targetKey ? 'verified' : sentFor === targetKey ? 'sent' : 'idle';

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const payload = useCallback(
    () => ({
      channel,
      purpose: 'SIGNUP' as const,
      ...(channel === 'PHONE'
        ? { dial_code: target.dial_code, phone_number: target.phone_number }
        : { email: target.email?.trim().toLowerCase() }),
    }),
    [channel, target.dial_code, target.phone_number, target.email],
  );

  const send = useCallback(async () => {
    setIsSending(true);
    setError(null);
    try {
      const dispatch = await AuthService.sendOtp(payload());
      setSentFor(targetKey);
      setSentTo(dispatch.sent_to);
      setDisplayCode(dispatch.display_code);
      setCooldown(dispatch.resend_in);
      setCode('');
    } catch (err) {
      setError(errorMessage(err, 'Could not send the code'));
    } finally {
      setIsSending(false);
    }
  }, [payload, targetKey]);

  const verify = useCallback(
    async (otp: string) => {
      setIsVerifying(true);
      setError(null);
      try {
        const result = await AuthService.verifyOtp({ ...payload(), otp });
        setToken(result.verification_token);
        setVerifiedFor(targetKey);
      } catch (err) {
        setError(errorMessage(err, 'Incorrect code'));
        setCode('');
      } finally {
        setIsVerifying(false);
      }
    },
    [payload, targetKey],
  );

  return {
    status,
    token: status === 'verified' ? token : null,
    code,
    setCode,
    sentTo,
    displayCode,
    cooldown,
    isSending,
    isVerifying,
    error,
    send,
    verify,
  };
}

export type OtpVerification = ReturnType<typeof useOtpVerification>;
