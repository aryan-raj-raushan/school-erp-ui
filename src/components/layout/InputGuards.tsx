"use client";

import { useEffect } from "react";

const isNumberInput = (el: EventTarget | null): el is HTMLInputElement =>
  el instanceof HTMLInputElement && el.type === "number";

export function InputGuards() {
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (isNumberInput(e.target) && e.target === document.activeElement) e.target.blur();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isNumberInput(e.target) && (e.key === "ArrowUp" || e.key === "ArrowDown")) e.preventDefault();
    };
    document.addEventListener("wheel", onWheel, { passive: true });
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
