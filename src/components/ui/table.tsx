import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({
  className,
  children,
  scrollRef,
  maxHeight,
}: React.HTMLAttributes<HTMLDivElement> & {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  maxHeight?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-background overflow-hidden shadow-sm', className)}>
      <div
        ref={scrollRef}
        style={maxHeight ? { maxHeight } : undefined}
        className={cn(
          'w-full',
          maxHeight ? 'overflow-auto' : 'overflow-x-auto',
          !maxHeight && '[&::-webkit-scrollbar]:hidden scrollbar-none',
        )}
      >
        <table className="w-full min-w-max text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border/40', className)} {...props} />;
}

export function TableHeadRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'sticky top-0 z-20 border-b-2 border-border bg-muted dark:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

type TableRowVariant = 'default' | 'danger' | 'muted';

const rowVariantMap: Record<TableRowVariant, string> = {
  default: '',
  danger: 'bg-red-50/60 dark:bg-red-950/10',
  muted: 'bg-muted/20',
};

export function TableRow({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { variant?: TableRowVariant }) {
  return (
    <tr
      className={cn(
        'transition-colors duration-100 hover:bg-accent/60 dark:hover:bg-accent/30',
        rowVariantMap[variant],
        className,
      )}
      {...props}
    />
  );
}

export function TableHeaderCell({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  primary,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { primary?: boolean }) {
  return (
    <td
      className={cn(
        'px-4 py-2.5',
        primary ? 'font-medium text-foreground' : 'text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center text-sm text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

export function TablePagination({ total, page, totalPages }: { total: number; page: number; totalPages: number }) {
  return (
    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
      <p className="text-xs text-muted-foreground font-medium">{total} total</p>
      <p className="text-xs text-muted-foreground font-medium">
        Page {page} / {totalPages}
      </p>
    </div>
  );
}
