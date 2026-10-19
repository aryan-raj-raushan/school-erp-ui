"use client";

import { useEffect } from "react";

/**
 * After a failed submit, scroll the first field marked `data-invalid`
 * (set by `FormField` when it has an error) into the middle of the screen.
 * Waits a beat so collapsed sections that auto-open have rendered first.
 */
export function useScrollToFirstError(submitCount: number, hasErrors: boolean) {
  useEffect(() => {
    if (submitCount === 0 || !hasErrors) return;
    const timer = setTimeout(() => {
      document
        .querySelector<HTMLElement>('[data-invalid="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(timer);
  }, [submitCount, hasErrors]);
}
