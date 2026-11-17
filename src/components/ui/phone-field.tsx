'use client';

import * as React from 'react';
import { Controller, type Control, type FieldValues, type Path, type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FormField } from './form';

interface PhoneFieldProps {
  label?: string;
  required?: boolean;
  dialCodeProps?: UseFormRegisterReturn;
  /** Display-only — the dial code is fixed and not user-editable */
  dialCodeValue?: string;
  phoneProps: UseFormRegisterReturn;
  phoneError?: string;
  disabled?: boolean;
  className?: string;
}

const PHONE_DIGITS = 10;
const URL_PREFIX = 'https://';

export function normalizePhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === PHONE_DIGITS + 2 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === PHONE_DIGITS + 1 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, PHONE_DIGITS);
}

export function stripUrlProtocol(url: string | null | undefined): string {
  return (url ?? '').trim().replace(/^https?:\/\//i, '');
}

export function withUrlProtocol(host: string): string {
  const value = stripUrlProtocol(host);
  return value ? `${URL_PREFIX}${value}` : '';
}

function PrefixedBox({
  prefix,
  error,
  disabled,
  children,
}: {
  prefix: string;
  error?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex h-11 items-stretch overflow-hidden rounded-[8px] border border-border bg-white/70 dark:bg-white/5 backdrop-blur-sm transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring max-md:h-12 max-md:rounded-2xl',
        disabled && 'opacity-50',
        error && 'border-destructive focus-within:ring-destructive/40 focus-within:border-destructive',
      )}
    >
      <span className="flex shrink-0 items-center border-r border-border bg-muted/40 px-3 text-sm text-muted-foreground select-none">
        {prefix}
      </span>
      {children}
    </div>
  );
}

const innerInputClass =
  'h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed';

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
      <PrefixedBox prefix={dialCodeValue} error={phoneError} disabled={disabled}>
        {dialCodeProps && <input type="hidden" {...dialCodeProps} />}
        <input
          {...phoneProps}
          onChange={(e) => {
            e.target.value = normalizePhoneInput(e.target.value);
            return phoneProps.onChange(e);
          }}
          type="tel"
          inputMode="numeric"
          maxLength={PHONE_DIGITS}
          autoComplete="tel-national"
          placeholder="10-digit mobile number"
          disabled={disabled}
          className={innerInputClass}
        />
      </PrefixedBox>
    </FormField>
  );
}

interface PhoneInputProps {
  label?: string;
  required?: boolean;
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  dialCode?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  label = 'Phone',
  required,
  value,
  onChange,
  onBlur,
  dialCode = '+91',
  error,
  disabled,
  className,
}: PhoneInputProps) {
  return (
    <FormField label={label} required={required} className={className} error={error}>
      <PrefixedBox prefix={dialCode} error={error} disabled={disabled}>
        <input
          value={value ?? ''}
          onChange={(e) => onChange(normalizePhoneInput(e.target.value))}
          onBlur={onBlur}
          type="tel"
          inputMode="numeric"
          maxLength={PHONE_DIGITS}
          autoComplete="tel-national"
          placeholder="10-digit mobile number"
          disabled={disabled}
          className={innerInputClass}
        />
      </PrefixedBox>
    </FormField>
  );
}

interface WebsiteInputProps {
  label?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function WebsiteInput({
  label = 'Website',
  value,
  onChange,
  onBlur,
  error,
  disabled,
  placeholder = 'school.edu.in',
  className,
}: WebsiteInputProps) {
  return (
    <FormField label={label} className={className} error={error}>
      <PrefixedBox prefix={URL_PREFIX} error={error} disabled={disabled}>
        <input
          value={stripUrlProtocol(value)}
          onChange={(e) => onChange(withUrlProtocol(e.target.value.replace(/\s/g, '')))}
          onBlur={onBlur}
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoComplete="url"
          placeholder={placeholder}
          disabled={disabled}
          className={innerInputClass}
        />
      </PrefixedBox>
    </FormField>
  );
}

export function WebsiteField<T extends FieldValues>({
  control,
  name,
  ...props
}: Omit<WebsiteInputProps, 'value' | 'onChange' | 'onBlur' | 'error'> & { control: Control<T>; name: Path<T> }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <WebsiteInput
          {...props}
          value={field.value as string | undefined}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
