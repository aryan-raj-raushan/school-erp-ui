"use client";

import * as React from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { EmptyState } from "./empty-state";
import type { FilterField } from "./filter-toolbar";
import { MobileFilterBar } from "./mobile-filter-bar";
import {
  FloatingActionButton,
  InfiniteScrollSentinel,
  MobileListSkeleton,
  PullIndicator,
} from "./mobile-list";

export interface MobileListScreenProps {
  filterFields: FilterField[];
  filterValues: Record<string, string | undefined>;
  onFilterChange: (next: Record<string, string | undefined>) => void;
  onFilterClear: () => void;
  filterSheetTitle?: string;
  /** Pull-to-refresh handler. */
  onRefresh: () => Promise<unknown> | void;
  /** Shown above the list, e.g. "24 students". Hidden while loading. */
  countLabel?: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle: string;
  emptyDescription?: string;
  /** Empty-state copy when filters are active. */
  emptyFilteredTitle?: string;
  emptyFilteredDescription?: string;
  /** Infinite scroll — omit for lists that load everything at once. */
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  fab?: { label: string; onClick: () => void; hidden?: boolean };
  /** The rows, usually a `<ul>` of `MobileListCard`s. */
  children: React.ReactNode;
}

/**
 * Standard phone layout for any entity list: search + filter sheet,
 * pull-to-refresh, count, skeleton / empty states, optional infinite
 * scroll and a floating add button. Screens only supply the rows.
 */
export function MobileListScreen({
  filterFields,
  filterValues,
  onFilterChange,
  onFilterClear,
  filterSheetTitle,
  onRefresh,
  countLabel,
  isLoading,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyFilteredTitle = "Nothing matches",
  emptyFilteredDescription = "Try changing or clearing your filters.",
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  fab,
  children,
}: MobileListScreenProps) {
  const pullState = usePullToRefresh(onRefresh);
  const hasFilters = Object.values(filterValues).some(Boolean);

  return (
    <div className="flex flex-col gap-3 pt-3">
      <MobileFilterBar
        fields={filterFields}
        values={filterValues}
        onChange={onFilterChange}
        onClear={onFilterClear}
        sheetTitle={filterSheetTitle}
      />

      <PullIndicator
        pull={pullState.pull}
        threshold={pullState.threshold}
        isRefreshing={pullState.isRefreshing}
      />

      {!isLoading && countLabel && (
        <p className="px-1 text-xs font-medium text-muted-foreground">{countLabel}</p>
      )}

      {isLoading && isEmpty ? (
        <MobileListSkeleton />
      ) : isEmpty ? (
        <EmptyState
          icon={emptyIcon}
          title={hasFilters ? emptyFilteredTitle : emptyTitle}
          description={hasFilters ? emptyFilteredDescription : emptyDescription}
        />
      ) : (
        children
      )}

      {onLoadMore && (
        <InfiniteScrollSentinel
          onReach={onLoadMore}
          isLoading={isLoadingMore}
          hasMore={hasMore}
        />
      )}

      {fab && !fab.hidden && (
        <FloatingActionButton label={fab.label} onClick={fab.onClick} />
      )}
    </div>
  );
}
