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

const inputBase =
  'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string; width?: InputWidth }
>(({ className, error, width = 'full', ...props }, ref) => (
  <input
    ref={ref}
    className={cn(inputBase, widthMap[width], error && 'border-destructive focus:ring-destructive/40', className)}
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
    className={cn(inputBase, widthMap[width], error && 'border-destructive', className)}
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
    className={cn(inputBase, widthMap[width], 'resize-none', error && 'border-destructive', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

interface FormFieldProps {
  label?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export const FileInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn('text-sm text-foreground file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted file:text-foreground', className)}
    {...props}
  />
));
FileInput.displayName = 'FileInput';

export function FormField({ label, error, htmlFor, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
