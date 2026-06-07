'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Generic hook for persisting filter state in URL query params.
 * Parses params from URL on mount; updates URL on filter change.
 * Works for any module — just pass the keys you care about.
 */
export function useFilterParams<T extends Record<string, string | undefined>>(
  defaults: T,
): [T, (next: Partial<T>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = Object.keys(defaults).reduce((acc, key) => {
    const val = searchParams.get(key);
    acc[key as keyof T] = (val ?? defaults[key as keyof T]) as T[keyof T];
    return acc;
  }, {} as T);

  const setFilters = useCallback(
    (next: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === '' || v === null) {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return [current, setFilters];
}