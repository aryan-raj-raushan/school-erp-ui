import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}
      {...props}
    >
      <table className="w-full text-sm">{children}</table>
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
      className={cn('border-b border-border bg-muted/50', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border last:border-0 hover:bg-muted/40 transition-colors',
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
      className={cn('px-4 py-3 text-left font-medium text-muted-foreground', className)}
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
        'px-4 py-3',
        primary ? 'font-medium text-foreground' : 'text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function TableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

interface TableFooterProps {
  total: number;
  page: number;
  totalPages: number;
}

export function TablePagination({ total, page, totalPages }: TableFooterProps) {
  return (
    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
      <p className="text-xs text-muted-foreground">{total} total</p>
      <p className="text-xs text-muted-foreground">
        Page {page} / {totalPages}
      </p>
    </div>
  );
}
