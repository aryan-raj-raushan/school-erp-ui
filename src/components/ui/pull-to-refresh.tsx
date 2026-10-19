"use client";

import * as React from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullIndicator } from "./mobile-list";

/**
 * Wraps a mobile screen so pulling down at the top of the page runs
 * `onRefresh` (with a haptic tick at the release threshold).
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown> | void;
  children: React.ReactNode;
}) {
  const { pull, isRefreshing, threshold } = usePullToRefresh(onRefresh);
  return (
    <>
      <PullIndicator pull={pull} threshold={threshold} isRefreshing={isRefreshing} />
      {children}
    </>
  );
}
