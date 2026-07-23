"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";

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
    // storage full / disabled — fail silently
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

interface UseSavedFormOptions<T extends FieldValues> {
  key: string;
  form: UseFormReturn<T>;
  enabled?: boolean;
  debounceMs?: number;
}

export function useSavedForm<T extends FieldValues>({
  key,
  form,
  enabled = true,
  debounceMs = 500,
}: UseSavedFormOptions<T>) {
  const [hasSavedForm, setHasSavedForm] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValuesRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    const stored = readLocalStorage<T>(key);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSavedForm(true);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, [key, enabled]);

  const persist = useCallback(
    (values: T) => {
      if (!enabled) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const serialized = JSON.stringify(values);
        if (serialized !== prevValuesRef.current) {
          prevValuesRef.current = serialized;
          writeLocalStorage(key, values);
          setHasSavedForm(true);
        }
      }, debounceMs);
    },
    [key, enabled, debounceMs],
  );

  const restore = useCallback(() => {
    const stored = readLocalStorage<T>(key);
    if (stored) {
      form.reset(stored);
    }
    setHasSavedForm(false);
  }, [key, form]);

  const discard = useCallback(() => {
    removeLocalStorage(key);
    setHasSavedForm(false);
    prevValuesRef.current = "";
  }, [key]);

  const clear = useCallback(() => {
    removeLocalStorage(key);
    setHasSavedForm(false);
    prevValuesRef.current = "";
  }, [key]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    hasSavedForm,
    isHydrated,
    persist,
    restore,
    discard,
    clear,
  };
}
