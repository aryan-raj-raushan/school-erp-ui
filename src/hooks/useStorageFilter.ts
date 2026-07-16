"use client";

import { useCallback, useEffect, useState } from "react";

export type StorageFilterBackend = "local" | "cookie";

interface UseStorageFilterOptions<T extends Record<string, unknown>> {
  /** Unique key from `STORAGE_FILTER_KEYS` — never inline a raw string. */
  key: string;
  /** Shape/value used before storage is read and whenever filters are cleared. */
  defaultValue: T;
  /** Where to persist. Defaults to localStorage. */
  storage?: StorageFilterBackend;
  /** Only used when storage === "cookie". Defaults to 30 days. */
  cookieMaxAgeDays?: number;
}

function readLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / disabled — persistence is a nice-to-have, fail silently
  }
}

function removeLocalStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readCookie<T>(key: string): T | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${key}=([^;]*)`),
  );
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as T;
  } catch {
    return null;
  }
}

function writeCookie<T>(key: string, value: T, maxAgeDays: number) {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${key}=${encodeURIComponent(
    JSON.stringify(value),
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function removeCookie(key: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=; path=/; max-age=0`;
}

/**
 * Persists filter state for a page in localStorage/cookies, so selected
 * filters survive reloads and revisits. Storage is only touched on the
 * client — the first render always uses `defaultValue`, then an effect
 * hydrates from storage (avoids SSR/client markup mismatches).
 */
export function useStorageFilter<T extends Record<string, unknown>>({
  key,
  defaultValue,
  storage = "local",
  cookieMaxAgeDays = 30,
}: UseStorageFilterOptions<T>) {
  // Snapshot the default once — `defaultValue` is commonly an inline object
  // literal at the call site, so its reference is unstable across renders.
  const [defaultSnapshot] = useState(defaultValue);
  const [filters, setFiltersState] = useState<T>(defaultSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // One-off read from an external system (localStorage/cookies) on mount —
    // must run in an effect since it isn't available during SSR.
    const stored =
      storage === "cookie" ? readCookie<T>(key) : readLocalStorage<T>(key);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiltersState({ ...defaultSnapshot, ...stored });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
    // Only re-hydrate if the storage key itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, storage]);

  const persist = useCallback(
    (value: T) => {
      if (storage === "cookie") {
        writeCookie(key, value, cookieMaxAgeDays);
      } else {
        writeLocalStorage(key, value);
      }
    },
    [key, storage, cookieMaxAgeDays],
  );

  const updateFilters = useCallback(
    (next: Partial<T>) => {
      setFiltersState((prev) => {
        const merged = { ...prev, ...next };
        persist(merged);
        return merged;
      });
    },
    [persist],
  );

  const clearFilters = useCallback(() => {
    setFiltersState(defaultSnapshot);
    if (storage === "cookie") {
      removeCookie(key);
    } else {
      removeLocalStorage(key);
    }
  }, [key, storage, defaultSnapshot]);

  const hasActiveFilters = Object.entries(filters).some(([field, value]) => {
    if (value === undefined || value === null || value === "") return false;
    return value !== defaultSnapshot[field];
  });

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    isHydrated,
  };
}
