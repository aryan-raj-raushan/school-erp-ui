'use client';

import { Loader2 } from 'lucide-react';
import { useSsoCallback } from '@/hooks/useSsoCallback';
import { Div, P, AuthCard } from '@/components/ui';

export default function SsoCallbackPage() {
  useSsoCallback();

  return (
    <AuthCard title="Signing you in" subtitle="Verifying your account, please wait…">
      <Div type="row" align="center" justify="center" gap="sm" padding="py-6">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
        <P color="muted" size="sm">Just a moment</P>
      </Div>
    </AuthCard>
  );
}
