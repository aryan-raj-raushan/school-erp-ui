"use client";

import { useEffect, useRef } from "react";
import { pushBackLayer } from "@/lib/back-stack";

/**
 * While `isOpen`, the Android hardware back button closes this layer
 * (the most recently opened one first) instead of navigating away.
 */
export function useBackLayer(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;
    return pushBackLayer(() => onCloseRef.current());
  }, [isOpen]);
}
