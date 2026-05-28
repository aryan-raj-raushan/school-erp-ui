import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SectionRowProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  full?: boolean;   // width: 100%
}

const gapMap = {
  xs: 'gap-1', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8',
};

export const Row = forwardRef<HTMLDivElement, SectionRowProps>(
  ({ gap = 'md', align = 'center', justify = 'start', wrap = false, full = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex',
        gapMap[gap],
        `items-${align}`,
        `justify-${justify}`,
        wrap && 'flex-wrap',
        full && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Row.displayName = 'Section.Row';

interface SectionColProps extends HTMLAttributes<HTMLDivElement> {
  gap?: keyof typeof gapMap;
  align?: 'start' | 'center' | 'end' | 'stretch';
  full?: boolean;
}

export const Col = forwardRef<HTMLDivElement, SectionColProps>(
  ({ gap = 'md', align = 'stretch', full = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col', gapMap[gap], `items-${align}`, full && 'w-full', className)}
      {...props}
    >
      {children}
    </div>
  ),
);
Col.displayName = 'Section.Col';

interface SectionGridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: keyof typeof gapMap;
  responsive?: boolean; // auto-collapses on mobile
}

export const Grid = forwardRef<HTMLDivElement, SectionGridProps>(
  ({ cols = 3, gap = 'md', responsive = true, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid',
        gapMap[gap],
        responsive ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}` : `grid-cols-${cols}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Grid.displayName = 'Section.Grid';

// Named export as Section namespace
export const Section = { Row, Col, Grid };