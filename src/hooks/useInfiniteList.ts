"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PaginationMeta } from "@/types";

export interface InfiniteListPage<T> {
  items: T[];
  /** Servers may omit it; the hook then infers "more" from a full page. */
  pagination?: PaginationMeta | null;
}

type PageParams<F> = F & { page: number; limit: number };

interface Options<T, F> {
  fetchPage: (params: PageParams<F>) => Promise<InfiniteListPage<T>>;
  initialFilters: F;
  limit?: number;
  errorMessage?: string;
}

/**
 * Accumulating, page-by-page list for mobile screens. Changing filters
 * restarts from page 1; `loadMore` appends the next page. Stale responses
 * (from superseded filters or refreshes) are discarded.
 */
export function useInfiniteList<T extends { id: string }, F extends object>({
  fetchPage,
  initialFilters,
  limit = 20,
  errorMessage = "Failed to load",
}: Options<T, F>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<F>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);
  const requestIdRef = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  });

  const load = useCallback(
    async (page: number, mode: "replace" | "append") => {
      const requestId = ++requestIdRef.current;
      if (mode === "append") setIsLoadingMore(true);

      try {
        const result = await fetchPageRef.current({ ...filters, page, limit });
        if (requestId !== requestIdRef.current) return;
        pageRef.current = page;
        const pageItems = result.items ?? [];
        setItems((prev) =>
          mode === "append" ? [...prev, ...pageItems] : pageItems,
        );
        const meta = result.pagination;
        setTotal(
          meta?.total ??
            (mode === "append" ? (prev) => prev + pageItems.length : pageItems.length),
        );
        setHasMore(
          meta ? page < meta.totalPages : pageItems.length === limit,
        );
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        toast.error(err instanceof Error ? err.message : errorMessage);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [filters, limit, errorMessage],
  );

  useEffect(() => {
    // Fetch-on-filter-change: the state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1, "replace");
  }, [load]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    void load(pageRef.current + 1, "append");
  }, [isLoading, isLoadingMore, hasMore, load]);

  const refresh = useCallback(() => load(1, "replace"), [load]);

  const updateFilters = useCallback((next: Partial<F>) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  const patchItem = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  return {
    items,
    total,
    filters,
    isLoading,
    isLoadingMore,
    hasMore,
    updateFilters,
    loadMore,
    refresh,
    removeItem,
    patchItem,
  };
}
