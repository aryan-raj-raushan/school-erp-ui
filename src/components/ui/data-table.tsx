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
}: DataTableProps<TData>) {
  const manualSort = sorting !== undefined && onSortingChange !== undefined;

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
    getCoreRowModel: getCoreRowModel(),
    ...(manualSort
      ? {
          state: { sorting },
          onSortingChange,
          manualSorting: true,
          getSortedRowModel: getSortedRowModel(),
        }
      : {}),
  });

  return (
    <>
      <Table scrollRef={scrollRef}>
        <TableHead>
          <TableHeadRow>
            {table.getHeaderGroups()[0]?.headers.map((header) => (
              <TableHeaderCell key={header.id}>
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
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Sticky scrollbar — sticks to bottom of viewport so it's always accessible */}
      <div
        ref={stickyBarRef}
        className="sticky bottom-0 overflow-x-auto overflow-y-hidden"
      >
        <div ref={stickyInnerRef} className="h-px" />
      </div>
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
