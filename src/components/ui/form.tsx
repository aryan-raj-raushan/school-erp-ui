import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label, ErrorText } from './typography';

type InputWidth = 'full' | 'auto' | 'xs' | 'sm' | 'md';

const widthMap: Record<InputWidth, string> = {
  full: 'w-full',
  auto: 'w-auto',
  xs: 'w-20',
  sm: 'w-32',
  md: 'w-48',
};

/* ring-ring and border-primary both resolve to CSS vars that update per theme */
const inputBase =
  'h-11 rounded-[18px] border border-border bg-white/70 dark:bg-white/5 backdrop-blur-sm px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50 transition-all duration-200';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string; width?: InputWidth }
>(({ className, error, width = 'full', ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      inputBase,
      widthMap[width],
      error && 'border-destructive focus:ring-destructive/40 focus:border-destructive',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string; width?: InputWidth }
>(({ className, error, width = 'full', children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      inputBase,
      widthMap[width],
      'cursor-pointer appearance-none',
      error && 'border-destructive focus:ring-destructive/40',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string; width?: InputWidth }
>(({ className, error, width = 'full', ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      inputBase,
      'h-auto min-h-[100px] resize-none',
      widthMap[width],
      error && 'border-destructive focus:ring-destructive/40',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const FileInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'text-sm text-foreground',
      /* file button uses primary color via CSS var */
      'file:mr-2 file:rounded-full file:border-0 file:px-3 file:py-1 file:text-xs file:font-medium file:transition-colors',
      'file:bg-[color:var(--theme-glow-soft)] file:text-foreground hover:file:opacity-80',
      className,
    )}
    {...props}
  />
));
FileInput.displayName = 'FileInput';

interface FormFieldProps {
  label?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, htmlFor, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
