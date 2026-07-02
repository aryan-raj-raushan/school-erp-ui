import * as React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FormField } from './form';

interface PhoneFieldProps {
  label?: string;
  required?: boolean;
  dialCodeProps: UseFormRegisterReturn;
  /** Display-only — the dial code is fixed and not user-editable */
  dialCodeValue?: string;
  phoneProps: UseFormRegisterReturn;
  phoneError?: string;
  disabled?: boolean;
  className?: string;
}

/** Fixed dial code + phone number in a single bordered box — used anywhere a phone number is collected. */
export function PhoneField({
  label = 'Phone',
  required,
  dialCodeProps,
  dialCodeValue = '+91',
  phoneProps,
  phoneError,
  disabled,
  className,
}: PhoneFieldProps) {
  return (
    <FormField label={label} required={required} className={className} error={phoneError}>
      <div
        className={cn(
          'flex h-11 items-stretch overflow-hidden rounded-[8px] border border-border bg-white/70 dark:bg-white/5 backdrop-blur-sm transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring',
          disabled && 'opacity-50',
          phoneError && 'border-destructive focus-within:ring-destructive/40 focus-within:border-destructive',
        )}
      >
        <span className="flex shrink-0 items-center border-r border-border bg-muted/40 px-3 text-sm text-muted-foreground select-none">
          {dialCodeValue}
        </span>
        <input type="hidden" {...dialCodeProps} />
        <input
          {...phoneProps}
          type="tel"
          placeholder="Phone number"
          disabled={disabled}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed"
        />
      </div>
    </FormField>
  );
}
