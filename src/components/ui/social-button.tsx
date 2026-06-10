'use client';

import * as React from 'react';
import { Div } from './layout';

/* ─────────────────────────────────────────────
   Google icon (official brand colors)
───────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Microsoft icon (official brand colors)
───────────────────────────────────────────── */
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" width={18} height={18} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SocialButton
   Uses native button + .social-button CSS class.
   onClick is optional — visual-only when omitted.
───────────────────────────────────────────── */
type SocialProvider = 'google' | 'microsoft';

interface SocialButtonProps {
  provider: SocialProvider;
  onClick?: () => void;
  disabled?: boolean;
}

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  microsoft: 'Continue with Microsoft',
};

const PROVIDER_ICONS: Record<SocialProvider, React.ReactNode> = {
  google: <GoogleIcon />,
  microsoft: <MicrosoftIcon />,
};

export function SocialButton({ provider, onClick, disabled }: SocialButtonProps) {
  return (
    <button
      type="button"
      className="social-button"
      onClick={onClick}
      disabled={disabled}
      aria-label={PROVIDER_LABELS[provider]}
    >
      {PROVIDER_ICONS[provider]}
      {PROVIDER_LABELS[provider]}
    </button>
  );
}

/* ─────────────────────────────────────────────
   SocialButtonGroup — Google + Microsoft stacked
───────────────────────────────────────────── */
interface SocialButtonGroupProps {
  onGoogle?: () => void;
  onMicrosoft?: () => void;
}

export function SocialButtonGroup({ onGoogle, onMicrosoft }: SocialButtonGroupProps) {
  return (
    <Div type="col" gap="sm">
      <SocialButton provider="google" onClick={onGoogle} />
      <SocialButton provider="microsoft" onClick={onMicrosoft} />
    </Div>
  );
}
