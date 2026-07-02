'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type Row,
  type RowData,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyRow,
  TableHead,
  TableHeaderCell,
  TableHeadRow,
  TablePagination,
  TableRow,
} from './table';
import { Spinner } from './spinner';

// Augment ColumnMeta so callers can flag primary cells per-column
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Renders cell text with font-medium foreground colour */
    primary?: boolean;
  }
}

// Re-export tanstack types for consumer convenience
export type { ColumnDef, SortingState, Row };

export interface DataTablePagination {
  total: number;
  page: number;
  totalPages: number;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  emptyText?: string;
  pagination?: DataTablePagination;
  /** Optional: returns the row variant used by TableRow */
  getRowVariant?: (row: Row<TData>) => 'default' | 'danger' | 'muted';
  /** Optional: called when a row is clicked */
  onRowClick?: (row: Row<TData>) => void;
  /** Optional: server-side sorting state */
  sorting?: SortingState;
  /** Optional: setter for server-side sorting (must pair with sorting) */
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  /**
   * Column IDs to pin to the left (sticky). Each column should declare a
   * `size` in its definition so offsets are computed correctly.
   */
  pinnedColumns?: string[];
  /**
   * Fixed height for the table scroll container.
   * Enables internal vertical scroll — the page itself won't scroll.
   * Example: "calc(100vh - 400px)"
   */
  maxHeight?: string;
  /**
   * Dynamically size the table to reach the bottom of the viewport,
   * measured live so it adapts to any screen size instead of a guessed
   * pixel offset. Ignored if maxHeight is also set.
   */
  fillViewport?: boolean;
}

function getPinnedStyle(column: Column<any>): React.CSSProperties | undefined {
  if (!column.getIsPinned()) return undefined;
  return { left: column.getStart('left') };
}

function getPinnedClass(column: Column<any>, isHeader: boolean): string {
  if (!column.getIsPinned()) return '';
  return isHeader
    ? 'sticky z-30 bg-muted shadow-[1px_0_0_0_hsl(var(--border))]'
    : 'sticky z-10 bg-background shadow-[1px_0_0_0_hsl(var(--border))]';
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyText = 'No data found',
  pagination,
  getRowVariant,
  onRowClick,
  sorting,
  onSortingChange,
  pinnedColumns,
  maxHeight,
  fillViewport,
}: DataTableProps<TData>) {
  const manualSort = sorting !== undefined && onSortingChange !== undefined;
  const showsPaginationFooter = !!pagination && pagination.totalPages > 1;

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stickyBarRef = React.useRef<HTMLDivElement>(null);
  const stickyInnerRef = React.useRef<HTMLDivElement>(null);

  // Keep sticky bar width in sync with actual table scroll width
  React.useEffect(() => {
    const el = scrollRef.current;
    const inner = stickyInnerRef.current;
    if (!el || !inner) return;
    const sync = () => { inner.style.width = el.scrollWidth + 'px'; };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, columns]);

  // Bidirectional scroll sync between table and sticky bar
  React.useEffect(() => {
    const el = scrollRef.current;
    const bar = stickyBarRef.current;
    if (!el || !bar) return;
    const onTable = () => { if (bar.scrollLeft !== el.scrollLeft) bar.scrollLeft = el.scrollLeft; };
    const onBar = () => { if (el.scrollLeft !== bar.scrollLeft) el.scrollLeft = bar.scrollLeft; };
    el.addEventListener('scroll', onTable);
    bar.addEventListener('scroll', onBar);
    return () => {
      el.removeEventListener('scroll', onTable);
      bar.removeEventListener('scroll', onBar);
    };
  }, []);

  const table = useReactTable<TData>({
    data,
    columns,
    enableColumnPinning: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnPinning: { left: pinnedColumns ?? [] },
      ...(manualSort && { sorting }),
    },
    ...(manualSort && {
      onSortingChange,
      manualSorting: true,
      getSortedRowModel: getSortedRowModel(),
    }),
  });

  return (
    <>
      <Table
        scrollRef={scrollRef}
        maxHeight={maxHeight}
        fillViewport={fillViewport}
        bottomOffset={showsPaginationFooter ? 72 : 8}
      >
        <TableHead>
          <TableHeadRow>
            {table.getHeaderGroups()[0]?.headers.map((header) => (
              <TableHeaderCell
                key={header.id}
                style={getPinnedStyle(header.column)}
                className={getPinnedClass(header.column, true)}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHeaderCell>
            ))}
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={columns.length}>
              <Spinner />
            </TableEmptyRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableEmptyRow colSpan={columns.length}>{emptyText}</TableEmptyRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                variant={getRowVariant ? getRowVariant(row) : 'default'}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer' : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    primary={cell.column.columnDef.meta?.primary}
                    style={getPinnedStyle(cell.column)}
                    className={getPinnedClass(cell.column, false)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Sticky scrollbar — only useful when the table has no fixed/auto height */}
      {!maxHeight && !fillViewport && (
        <div
          ref={stickyBarRef}
          className="sticky bottom-0 overflow-x-auto overflow-y-hidden"
        >
          <div ref={stickyInnerRef} className="h-px" />
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </>
  );
}
