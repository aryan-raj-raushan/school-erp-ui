"use client";

import * as React from "react";
import { flexRender, type Cell, type Row, type Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileListSkeleton } from "./mobile-list";

const SKIPPED_COLUMNS = new Set(["index", "select"]);
const VISIBLE_DETAILS = 6;

type RowVariant = "default" | "danger" | "muted";

export interface MobileDataCardsProps<TData> {
  table: Table<TData>;
  isLoading?: boolean;
  emptyText: string;
  onRowClick?: (row: Row<TData>) => void;
  getRowVariant?: (row: Row<TData>) => RowVariant;
  /** Show every field instead of folding extras behind "Show more" (data-entry rows). */
  showAllDetails?: boolean;
}

/** Action buttons and header-less control columns (expand toggles …) sit top-right. */
function isControlColumn<TData>(cell: Cell<TData, unknown>) {
  return (
    cell.column.id.toLowerCase().includes("action") ||
    cell.column.columnDef.header === ""
  );
}

function headerLabel<TData>(cell: Cell<TData, unknown>) {
  const header = cell.column.columnDef.header;
  if (typeof header === "string" && header) return header;
  return cell.column.id.replace(/[_-]/g, " ");
}

function render<TData>(cell: Cell<TData, unknown>) {
  return flexRender(cell.column.columnDef.cell, cell.getContext());
}

function DataCard<TData>({
  row,
  variant,
  onClick,
  showAll,
}: {
  row: Row<TData>;
  variant: RowVariant;
  onClick?: () => void;
  showAll: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const cells = row
    .getVisibleCells()
    .filter(
      (c) =>
        !SKIPPED_COLUMNS.has(c.column.id) &&
        c.column.columnDef.meta?.mobile !== "hide",
    );
  const controlCells = cells.filter(isControlColumn);
  const content = cells.filter((c) => !controlCells.includes(c));
  const titleCell = content.find((c) => c.column.columnDef.meta?.primary) ?? content[0];
  const rest = content.filter((c) => c !== titleCell);
  const subtitleCell = rest.find((c) => c.column.columnDef.meta?.mobile === "subtitle");
  const badgeCells = rest.filter((c) => c.column.columnDef.meta?.mobile === "badge");
  const details = rest.filter((c) => c !== subtitleCell && !badgeCells.includes(c));
  const shownDetails = expanded || showAll ? details : details.slice(0, VISIBLE_DETAILS);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 dark:bg-neutral-900",
        variant === "danger" ? "border-destructive/40" : "border-border/60",
        variant === "muted" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2">
        <div
          role={onClick ? "button" : undefined}
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          onKeyDown={(e) => {
            if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
          }}
          className={cn("min-w-0 flex-1", onClick && "active:opacity-70")}
        >
          <div className="text-[15px] font-semibold [&_*]:min-w-0">
            {titleCell && render(titleCell)}
          </div>
          {subtitleCell && (
            <div className="mt-0.5 text-[13px] text-muted-foreground">{render(subtitleCell)}</div>
          )}
          {badgeCells.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {badgeCells.map((c) => (
                <span key={c.id}>{render(c)}</span>
              ))}
            </div>
          )}
        </div>
        {controlCells.length > 0 && (
          <div className="-mr-2 -mt-1.5 flex shrink-0 items-center">
            {controlCells.map((c) => (
              <div key={c.id}>{render(c)}</div>
            ))}
          </div>
        )}
      </div>

      {details.length > 0 && (
        <dl
          onClick={onClick}
          className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 pt-3"
        >
          {shownDetails.map((c) => (
            <div key={c.id} className="min-w-0">
              <dt className="text-[11px] capitalize text-muted-foreground">{headerLabel(c)}</dt>
              <dd className="mt-0.5 break-words text-sm">{render(c)}</dd>
            </div>
          ))}
        </dl>
      )}

      {!showAll && details.length > VISIBLE_DETAILS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-xl text-xs font-medium text-primary-text active:bg-muted"
        >
          {expanded ? "Show less" : `Show ${details.length - VISIBLE_DETAILS} more`}
          <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

/**
 * Phone rendering of a `DataTable`: every row becomes a card built from the
 * same column definitions — the `primary` column is the title, the actions
 * column sits top-right and the rest become label / value pairs. Columns
 * can opt out or change role with `meta.mobile` ("hide" | "badge" | "subtitle").
 */
export function MobileDataCards<TData>({
  table,
  isLoading,
  emptyText,
  onRowClick,
  getRowVariant,
  showAllDetails = false,
}: MobileDataCardsProps<TData>) {
  const rows = table.getRowModel().rows;

  if (isLoading && rows.length === 0) return <MobileListSkeleton rows={5} />;

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.id}>
          <DataCard
            row={row}
            variant={getRowVariant ? getRowVariant(row) : "default"}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            showAll={showAllDetails}
          />
        </li>
      ))}
    </ul>
  );
}
