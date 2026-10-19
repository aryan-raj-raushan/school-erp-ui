"use client";

import { useEffect } from "react";

const SCROLL_DELAY_MS = 120;

/**
 * Scroll the first visible field marked `data-invalid` (set by `FormField`
 * when it has an error) to the middle of the screen.
 */
export function scrollToFirstInvalidField() {
  const firstVisible = Array.from(
    document.querySelectorAll<HTMLElement>('[data-invalid="true"]'),
  ).find((node) => node.offsetParent !== null);
  firstVisible?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * After a failed submit, bring the first invalid field into view. Waits a
 * beat so steps and collapsed sections that auto-open have rendered.
 */
export function useScrollToFirstError(submitCount: number, hasErrors: boolean) {
  useEffect(() => {
    if (submitCount === 0 || !hasErrors) return;
    const timer = setTimeout(scrollToFirstInvalidField, SCROLL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [submitCount, hasErrors]);
}
