import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;       // semantic tag override
  size?: HeadingLevel;     // visual size override (separate from semantic level!)
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'danger';
  truncate?: boolean;
}

// These map to CSS vars, not hardcoded Tailwind sizes
// so they automatically scale with --font-size-base
const sizeStyles: Record<HeadingLevel, string> = {
  h1: 'text-[var(--font-size-h1)] leading-tight tracking-tight',
  h2: 'text-[var(--font-size-h2)] leading-tight',
  h3: 'text-[var(--font-size-h3)] leading-snug',
  h4: 'text-[var(--font-size-h4)] leading-snug',
  h5: 'text-[var(--font-size-h5)] leading-normal',
  h6: 'text-[var(--font-size-h6)] leading-normal',
};

const colorStyles = {
  default: 'text-[var(--color-text-primary)]',
  muted:   'text-[var(--color-text-secondary)]',
  primary: 'text-[var(--color-primary)]',
  danger:  'text-[var(--color-danger)]',
};

const weightStyles = {
  normal:   'font-normal',
  medium:   'font-medium',
  semibold: 'font-semibold',
  bold:     'font-bold',
};

const defaultWeight: Record<HeadingLevel, TitleProps['weight']> = {
  h1: 'bold', h2: 'bold', h3: 'semibold',
  h4: 'semibold', h5: 'medium', h6: 'medium',
};

export const TitleBase = forwardRef<HTMLHeadingElement, TitleProps & { level: HeadingLevel }>(
  ({ level, as, size, weight, color = 'default', truncate = false, className, children, ...props }, ref) => {
    const Tag = as ?? level;
    const visualSize = size ?? level;
    const fontWeight = weight ?? defaultWeight[level];

    return (
      <Tag
        ref={ref}
        className={cn(
          sizeStyles[visualSize],
          colorStyles[color],
          weightStyles[fontWeight!],
          'font-[var(--font-family-base)]',
          truncate && 'truncate',
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

// Convenience named exports matching your senior's requirement
export const H1 = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) =>
  <TitleBase ref={ref} level="h1" {...props} />
);
export const H2 = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) =>
  <TitleBase ref={ref} level="h2" {...props} />
);
export const H3 = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) =>
  <TitleBase ref={ref} level="h3" {...props} />
);
// ... H4, H5, H6 same pattern

export const Title = { H1, H2, H3 }; // Title.H1 matches your senior's naming