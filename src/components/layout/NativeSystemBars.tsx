"use client";

import { useEffect, useState } from "react";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { isLightColor } from "@/store/theme.store";

function readColor(name: string): string | null {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return /^#[0-9a-f]{6}$/i.test(v) ? v : null;
}

export function NativeSystemBars() {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const root = document.documentElement;
    const sync = () => {
      const c = readColor("--theme-gradient-from");
      setColor(c);
      const isDark = root.classList.contains("dark");
      const light = c ? isLightColor(c) : !isDark;
      SystemBars.setStyle({ style: light ? SystemBarsStyle.Light : SystemBarsStyle.Dark }).catch(() => {});
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class", "data-template", "style"] });
    return () => obs.disconnect();
  }, []);

  if (!Capacitor.isNativePlatform()) return null;

  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 inset-x-0 z-[45] pointer-events-none"
        style={{ height: "var(--sat)", background: color ?? "var(--theme-gradient-from)" }}
      />
      <div
        aria-hidden
        className="fixed bottom-0 inset-x-0 z-[45] pointer-events-none bg-background"
        style={{ height: "var(--sab)" }}
      />
    </>
  );
}
