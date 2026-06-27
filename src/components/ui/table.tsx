import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({
  className,
  children,
  scrollRef,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { scrollRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={scrollRef} className={cn('w-full overflow-x-auto', scrollRef && '[&::-webkit-scrollbar]:hidden scrollbar-none')}>
      <div
        className={cn('inline-block min-w-full rounded-2xl border border-border/50 bg-card backdrop-blur-sm overflow-hidden glass-card', className)}
        {...props}
      >
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('', className)} {...props} />;
}

export function TableHeadRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border/60 bg-white/80 dark:bg-white/5 backdrop-blur-sm sticky top-0',
        className,
      )}
      {...props}
    />
  );
}

type TableRowVariant = 'default' | 'danger' | 'muted';

const rowVariantMap: Record<TableRowVariant, string> = {
  default: '',
  danger: 'bg-red-50/50 dark:bg-red-950/10',
  muted: 'bg-muted/20',
};

export function TableRow({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { variant?: TableRowVariant }) {
  return (
    <tr
      /* table-row-hover applies var(--theme-glow-soft) on hover — theme-aware */
      className={cn(
        'border-b border-border/40 last:border-0 table-row-hover transition-colors duration-150',
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
        'px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground',
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
        'px-5 py-3.5',
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
      <td colSpan={colSpan} className="px-5 py-16 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

export function TablePagination({ total, page, totalPages }: { total: number; page: number; totalPages: number }) {
  return (
    <div className="px-5 py-3.5 border-t border-border/40 flex items-center justify-between bg-white/50 dark:bg-white/3">
      <p className="text-xs text-muted-foreground font-medium">{total} total</p>
      <p className="text-xs text-muted-foreground font-medium">
        Page {page} / {totalPages}
      </p>
    </div>
  );
}
