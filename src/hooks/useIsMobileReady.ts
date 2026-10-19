"use client";

import { useEffect, useState } from "react";

const MOBILE_MAX_WIDTH = 767;

/**
 * Like `useIsMobile`, but returns `undefined` until the viewport has been
 * measured. Lets pages that swap between mobile and desktop layouts wait
 * for the real answer instead of flashing the wrong layout (or firing the
 * wrong data fetch) on first paint.
 */
export function useIsMobileReady(): boolean | undefined {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
