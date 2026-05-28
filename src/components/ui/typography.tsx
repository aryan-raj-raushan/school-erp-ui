import * as React from 'react';
import { cn } from '@/lib/utils';

type ColorValue = 'default' | 'muted' | 'primary' | 'danger' | 'success';

const colorMap: Record<ColorValue, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-foreground/80',
  danger: 'text-destructive',
  success: 'text-emerald-600 dark:text-emerald-400',
};

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  color?: ColorValue;
}

export function H1({ color = 'default', className, ...props }: TypographyProps) {
  return (
    <h1 className={cn('text-xl font-semibold', colorMap[color], className)} {...props} />
  );
}

export function H2({ color = 'default', className, ...props }: TypographyProps) {
  return (
    <h2 className={cn('text-lg font-semibold', colorMap[color], className)} {...props} />
  );
}

export function H3({ color = 'muted', className, ...props }: TypographyProps) {
  return (
    <h3 className={cn('text-sm font-medium', colorMap[color], className)} {...props} />
  );
}

export function P({ color = 'muted', className, ...props }: TypographyProps) {
  return (
    <p className={cn('text-sm', colorMap[color], className)} {...props} />
  );
}

export function Span({ color = 'default', className, ...props }: TypographyProps) {
  return (
    <span className={cn('text-sm', colorMap[color], className)} {...props} />
  );
}

export function Label({
  color = 'default',
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { color?: ColorValue }) {
  return (
    <label className={cn('text-sm font-medium text-foreground/80', colorMap[color === 'default' ? 'primary' : color], className)} {...props} />
  );
}

export function ErrorText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-destructive', className)} {...props} />
  );
}

export function SectionLabel({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)} {...props} />
  );
}
