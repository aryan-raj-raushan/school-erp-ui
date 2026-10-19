"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTicking = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      stopTicking();
      setVisible(true);
      setProgress(12);
      timer.current = setInterval(() => setProgress((p) => (p < 85 ? p + (90 - p) * 0.12 : p)), 120);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      stopTicking();
    };
  }, []);

  useEffect(() => {
    stopTicking();
    const finish = setTimeout(() => setProgress(100), 0);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
    return () => {
      clearTimeout(finish);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 z-[60] h-[3px]"
      style={{ top: "var(--sat, 0px)", opacity: visible ? 1 : 0, transition: "opacity 200ms" }}
    >
      <div
        className="h-full rounded-r-full"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--theme-active-text), var(--theme-gradient-to))",
          opacity: 0.55,
          transition: "width 200ms ease-out",
        }}
      />
    </div>
  );
}
