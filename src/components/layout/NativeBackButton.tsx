"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { closeTopBackLayer } from "@/lib/back-stack";

/**
 * Owns the Android hardware back button: closes the topmost open sheet or
 * dialog first, otherwise goes back in history, and exits from the first screen.
 */
export function NativeBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handle = App.addListener("backButton", ({ canGoBack }) => {
      if (closeTopBackLayer()) return;
      if (canGoBack) window.history.back();
      else void App.exitApp();
    });

    return () => {
      void handle.then((h) => h.remove());
    };
  }, []);

  return null;
}
