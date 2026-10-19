"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";

const subscribeNoop = () => () => {};
const EDGE_GAP = 16;

export interface ScreenFabProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

/**
 * Viewport-fixed floating action button, for headers that can't place a
 * sticky FAB at the end of their content. Rendered in a portal (page
 * transitions would otherwise capture `position: fixed`) and lifted above
 * the tab bar and the home-indicator inset.
 */
export function ScreenFab({ label, icon = <Plus size={22} />, onClick }: ScreenFabProps) {
  const mounted = React.useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [bottom, setBottom] = React.useState<string>(
    `calc(var(--sab, 0px) + ${EDGE_GAP}px)`,
  );

  React.useLayoutEffect(() => {
    const tabBar = document.querySelector<HTMLElement>('nav[aria-label="Primary"]');
    if (!tabBar) return;
    const measure = () => {
      const distanceFromBottom = window.innerHeight - tabBar.getBoundingClientRect().top;
      setBottom(`${distanceFromBottom + EDGE_GAP}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tabBar);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full active:scale-95"
      style={{
        bottom,
        background:
          "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))",
        color: "var(--theme-active-text)",
        boxShadow: "0 8px 20px var(--theme-glow)",
      }}
    >
      {icon}
    </button>,
    document.body,
  );
}
