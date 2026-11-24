'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
}

export function OtpInput({ value, onChange, onComplete, disabled, autoFocus, invalid }: OtpInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next: string, focusIndex: number) => {
    const clean = next.replace(/\D/g, '').slice(0, LENGTH);
    onChange(clean);
    refs.current[Math.min(focusIndex, LENGTH - 1)]?.focus();
    if (clean.length === LENGTH) onComplete?.(clean);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="One-time code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          maxLength={index === 0 ? LENGTH : 1}
          disabled={disabled}
          value={digit}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, '');
            if (typed.length > 1) {
              commit(typed, typed.length);
              return;
            }
            const next = digits.slice();
            next[index] = typed;
            commit(next.join(''), typed ? index + 1 : index);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[index] && index > 0) {
              const next = digits.slice();
              next[index - 1] = '';
              commit(next.join(''), index - 1);
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
            commit(pasted, pasted.length);
          }}
          className={cn(
            'h-12 w-full min-w-0 max-w-[52px] rounded-xl border bg-white text-center text-lg font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50',
            invalid ? 'border-rose-400' : 'border-border',
          )}
        />
      ))}
    </div>
  );
}
