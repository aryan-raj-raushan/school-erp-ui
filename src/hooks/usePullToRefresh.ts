"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/haptics";

const THRESHOLD = 70;
const MAX_PULL = 110;

/**
 * Pull-to-refresh for the app's scroll container (`<main>`). Returns the
 * current pull distance and refreshing flag so a screen can render its own
 * indicator. Only engages when the container is scrolled to the very top.
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown> | void) {
  const [pull, setPull] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  const setPullValue = useCallback((value: number) => {
    pullRef.current = value;
    setPull(value);
  }, []);

  useEffect(() => {
    const container = document.querySelector("main");
    if (!container) return;

    function onTouchStart(e: TouchEvent) {
      if (refreshingRef.current || (container?.scrollTop ?? 0) > 0) return;
      startY.current = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0 || (container?.scrollTop ?? 0) > 0) {
        if (pullRef.current !== 0) setPullValue(0);
        return;
      }
      const eased = Math.min(MAX_PULL, delta * 0.5);
      if (pullRef.current < THRESHOLD && eased >= THRESHOLD) void haptic("light");
      setPullValue(eased);
    }

    async function onTouchEnd() {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current < THRESHOLD) {
        setPullValue(0);
        return;
      }
      refreshingRef.current = true;
      setIsRefreshing(true);
      setPullValue(THRESHOLD);
      try {
        await onRefreshRef.current();
      } finally {
        refreshingRef.current = false;
        setIsRefreshing(false);
        setPullValue(0);
      }
    }

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("touchcancel", onTouchEnd);
    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [setPullValue]);

  return { pull, isRefreshing, threshold: THRESHOLD };
}
