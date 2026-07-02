import * as React from 'react';
import { cn } from '@/lib/utils';

/** Nearest ancestor that actually scrolls — the boundary the table has to fit inside. */
function getScrollParent(node: HTMLElement): HTMLElement {
  let el = node.parentElement;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
    el = el.parentElement;
  }
  return document.documentElement;
}

/** Sum of bottom padding on every ancestor between el and the scroll boundary. */
function getTrailingSpace(el: HTMLElement, scrollParent: HTMLElement): number {
  let total = 0;
  let node = el.parentElement;
  while (node && node !== scrollParent) {
    total += parseFloat(getComputedStyle(node).paddingBottom) || 0;
    node = node.parentElement;
  }
  return total;
}

// Table wrapper has a 1px border top + bottom outside the sized inner scroll box.
const WRAPPER_BORDER = 2;

/**
 * Measures the live gap between an element's top and the bottom of its
 * actual scroll boundary (accounting for ancestor padding, not just the
 * raw viewport), so a fixed-height region reaches the bottom of the screen
 * with no leftover page-level scroll, on any screen size.
 */
function useFillViewportHeight(enabled: boolean, bottomOffset: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<string>();

  React.useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const scrollParent = getScrollParent(el);
      const boundary = scrollParent.getBoundingClientRect().bottom;
      const trailing = getTrailingSpace(el, scrollParent);
      const top = el.getBoundingClientRect().top;
      setHeight(
        `${Math.max(boundary - top - trailing - bottomOffset - WRAPPER_BORDER, 160)}px`,
      );
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    // Watch the actual scroll boundary (not document.body) so late-mounting
    // chrome — e.g. the header/sidebar, which load client-side only and can
    // still be missing on first paint after a hard refresh — is caught as
    // soon as it changes the available space, not just on next resize.
    const scrollParent = getScrollParent(el);
    const ro = new ResizeObserver(update);
    ro.observe(scrollParent);
    ro.observe(document.body);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      ro.disconnect();
    };
  }, [enabled, bottomOffset]);

  return { ref, height };
}

export function Table({
  className,
  children,
  scrollRef,
  maxHeight,
  fillViewport,
  bottomOffset = 8,
}: React.HTMLAttributes<HTMLDivElement> & {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  maxHeight?: string;
  /** Dynamically size the scroll area to reach the bottom of the viewport. */
  fillViewport?: boolean;
  /** Space to leave below the table when fillViewport is set. */
  bottomOffset?: number;
}) {
  const { ref: wrapperRef, height: autoHeight } = useFillViewportHeight(
    !!fillViewport && !maxHeight,
    bottomOffset,
  );
  const resolvedMaxHeight = maxHeight ?? autoHeight;

  return (
    <div
      ref={wrapperRef}
      className={cn('rounded-2xl border border-border bg-background overflow-hidden shadow-sm', className)}
    >
      <div
        ref={scrollRef}
        style={resolvedMaxHeight ? { maxHeight: resolvedMaxHeight } : undefined}
        className={cn(
          'w-full',
          resolvedMaxHeight ? 'overflow-auto' : 'overflow-x-auto',
          !resolvedMaxHeight && '[&::-webkit-scrollbar]:hidden scrollbar-none',
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
