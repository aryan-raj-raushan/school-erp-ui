import * as React from 'react';
import { cn } from '@/lib/utils';

type JustifyValue = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type AlignValue = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
type GapValue = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ColsValue = 1 | 2 | 3 | 4 | 6 | 12;

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

interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'row' | 'col' | 'grid';
  justify?: JustifyValue;
  align?: AlignValue;
  gap?: GapValue;
  cols?: ColsValue;
  full?: boolean;
  responsive?: boolean;
  wrap?: boolean;
  padding?:string
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
    padding,
    className,
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
