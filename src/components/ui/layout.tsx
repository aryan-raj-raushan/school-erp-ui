import * as React from 'react';
import { cn } from '@/lib/utils';

type JustifyValue = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type AlignValue = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
type GapValue = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ColsValue = 1 | 2 | 3 | 4 | 6 | 12;
type DivVariant =
  | 'card' | 'card-dashed' | 'inset' | 'preview'
  | 'glass' | 'glass-sm' | 'glass-flat'
  | 'theme-icon' | 'theme-icon-lg' | 'theme-icon-sm'
  | 'icon-muted'
  | 'gradient-bar';
type DivColor = 'default' | 'green' | 'red' | 'yellow';

const justifyMap: Record<JustifyValue, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const alignMap: Record<AlignValue, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const gapMap: Record<GapValue, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const colsMap: Record<ColsValue, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const variantMap: Record<DivVariant, string> = {
  card: 'rounded-2xl border border-border/50 bg-card backdrop-blur-sm glass-card',
  'card-dashed': 'rounded-2xl border border-dashed border-border p-8 text-center',
  inset: 'rounded-lg bg-muted/40 px-3 py-2',
  preview: 'overflow-auto max-h-[70vh] rounded border border-border bg-white p-4',
  glass: 'rounded-2xl border border-border/50 bg-card backdrop-blur-sm glass-card',
  'glass-sm': 'rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm glass-card',
  'glass-flat': 'rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm',
  /* Theme-aware icon circles — uses CSS utility classes */
  'theme-icon':    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-gradient-bg theme-glow-shadow theme-icon-children',
  'theme-icon-lg': 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl theme-gradient-bg theme-glow-shadow theme-icon-children',
  'theme-icon-sm': 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg theme-gradient-bg theme-glow-shadow theme-icon-children',
  /* Neutral muted icon circle */
  'icon-muted':    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground',
  /* Thin gradient accent bar */
  'gradient-bar': 'h-[3px] w-full theme-gradient-bg rounded-full',
};

const colorMap: Record<DivColor, string> = {
  default: 'rounded-lg border border-border bg-card px-4 py-2 text-center',
  green: 'rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 px-4 py-2 text-center',
  red: 'rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-2 text-center',
  yellow: 'rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-2 text-center',
};

interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'row' | 'col' | 'grid';
  justify?: JustifyValue;
  align?: AlignValue;
  gap?: GapValue;
  cols?: ColsValue;
  full?: boolean;
  responsive?: boolean;
  wrap?: boolean;
  padding?: string;
  /** Card / inset / preview surface variant */
  variant?: DivVariant;
  /** Colored stat-box variant (sets border + bg + center) */
  color?: DivColor;
  /** cursor-pointer + hover:bg-muted/50 + transition */
  interactive?: boolean;
  /** border-primary bg-primary/5 when true (use with interactive) */
  selected?: boolean;
  /** text-center */
  center?: boolean;
  /** flex-1 */
  grow?: boolean;
  boxCard?: boolean
}

export function Div({
  type = 'col',
  justify,
  align,
  gap,
  cols = 3,
  full,
  responsive,
  wrap,
  padding,
  variant,
  color,
  interactive,
  selected,
  center,
  grow,
  boxCard,
  className,
  children,
  ...props
}: DivProps) {
  const base =
    type === 'row'
      ? 'flex flex-row'
      : type === 'grid'
        ? 'grid'
        : 'flex flex-col';

  const classes = cn(
    base,
    type === 'grid' && colsMap[cols],
    type === 'grid' && responsive && 'sm:grid-cols-2 md:grid-cols-3',
    justify && justifyMap[justify],
    align && alignMap[align],
    gap && gapMap[gap],
    full && 'w-full',
    wrap && 'flex-wrap',
    grow && 'flex-1',
    center && 'text-center',
    // color stat-box takes full styling
    color && colorMap[color],
    // variant card/inset/preview — padding is separate via padding prop
    variant && variantMap[variant],
    // interactive selectable card
    interactive && 'cursor-pointer transition-colors',
    interactive && !selected && 'hover:bg-muted/50',
    selected && 'border-primary bg-primary/5',
    boxCard && 'group rounded-xl border border-border bg-card p-5 hover:bg-muted/40 hover:border-border/80 transition-all',
    padding,
    className,
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
