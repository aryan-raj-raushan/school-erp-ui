'use client';

import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useVerifyPhonePage } from '@/hooks/useVerifyPhonePage';
import { AuthCard, AuthNotice, Button, Div, OtpDisplay, OtpInput } from '@/components/ui';

export default function VerifyPhonePage() {
  const vm = useVerifyPhonePage();
  if (!vm.pending) return null;

  return (
    <AuthCard
      title="Verify your mobile number"
      subtitle="One-time check — after this you sign in with just your password."
    >
      <Div type="col" gap="md">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Smartphone size={20} />
          </span>
          <p className="text-sm text-muted-foreground">
            Verification code for <span className="font-semibold text-foreground">{vm.pending.sent_to}</span>
          </p>
        </div>

        <OtpDisplay code={vm.displayCode} />

        {vm.error && <AuthNotice tone="error">{vm.error}</AuthNotice>}

        <OtpInput
          value={vm.code}
          onChange={vm.setCode}
          onComplete={(otp) => void vm.submit(otp)}
          disabled={vm.isLoading}
          invalid={!!vm.error}
          autoFocus
        />

        <Button
          type="button"
          fullWidth
          className="h-12 rounded-xl text-[15px]"
          loading={vm.isLoading}
          disabled={vm.code.length !== 6}
          onClick={() => void vm.submit(vm.code)}
        >
          Verify and continue
        </Button>

        <Div type="row" justify="between" align="center">
          <Link href={ROUTES.login} className="text-sm text-muted-foreground hover:underline">
            Use a different account
          </Link>
          <button
            type="button"
            className="text-sm font-semibold text-primary disabled:text-muted-foreground"
            disabled={vm.cooldown > 0 || vm.isResending}
            onClick={() => void vm.resend()}
          >
            {vm.cooldown > 0 ? `Resend in ${vm.cooldown}s` : 'Resend code'}
          </button>
        </Div>
      </Div>
    </AuthCard>
  );
}
