import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label, ErrorText } from './typography';

type InputWidth = 'full' | 'auto' | 'xs' | 'sm' | 'md';

const widthMap: Record<InputWidth, string> = {
  full: 'w-full',
  auto: 'w-auto max-w-full',
  xs: 'w-20 max-w-full',
  sm: 'w-32 max-w-full',
  md: 'w-48 max-w-full',
};

/* ring-ring and border-primary both resolve to CSS vars that update per theme */
export const inputBase =
  'h-11 rounded-[8px] border border-border bg-white/70 dark:bg-white/5 backdrop-blur-sm px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50 transition-all duration-200';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string; width?: InputWidth }
>(({ className, type, error, width = 'full', ...props }, ref) => {
  if (type === 'checkbox') {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn('h-4 w-4 cursor-pointer accent-primary', className)}
        {...props}
      />
    );
  }
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        inputBase,
        widthMap[width],
        error && 'border-destructive focus:ring-destructive/40 focus:border-destructive bg-destructive/5',
        className,
      )}
      {...props}
    />
  );
});
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
      error && 'border-destructive focus:ring-destructive/40 focus:border-destructive bg-destructive/5',
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
      error && 'border-destructive focus:ring-destructive/40 focus:border-destructive bg-destructive/5',
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
  hint?: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, hint, htmlFor, required, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor} className={error ? 'text-destructive font-medium' : ''}>
          {label}{required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <ErrorText className="bg-destructive/10 px-2 py-1 rounded-md">{error}</ErrorText>
      )}
    </div>
  );
}
