import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'danger' | 'destructive' | 'info' | 'purple';

const variantMap: Record<BadgeVariant, string> = {
  /* primary uses CSS vars → theme-aware */
  primary: '',
  default: 'bg-muted text-muted-foreground',
  secondary: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  destructive: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', className, style, ...props }: BadgeProps) {
  const isPrimary = variant === 'primary';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantMap[variant],
        className,
      )}
      style={
        isPrimary
          ? {
              background: 'var(--theme-glow-soft)',
              color: 'var(--theme-gradient-from)',
              ...style,
            }
          : style
      }
      {...props}
    />
  );
}
