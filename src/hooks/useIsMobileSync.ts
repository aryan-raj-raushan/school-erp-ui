"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
const getServerSnapshot = () => false;

/**
 * Viewport check that is correct on the very first client render (no
 * desktop-layout flash on phones) and follows rotation / window resizes.
 */
export function useIsMobileSync(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
