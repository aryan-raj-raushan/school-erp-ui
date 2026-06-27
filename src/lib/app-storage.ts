"use client";

import { Capacitor } from "@capacitor/core";

async function getPreferences() {
  const { Preferences } = await import("@capacitor/preferences");
  return Preferences;
}

/**
 * On native: localStorage (sync, persists in Capacitor WebView) + Preferences backup.
 * On web:    localStorage (sync).
 *
 * initAppStorage() restores from Preferences into localStorage on cold start —
 * call it once at app boot before reading auth state.
 */
export async function initAppStorage(keys: string[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (typeof window === "undefined") return;

  const needsRestore = keys.some((k) => localStorage.getItem(k) === null);
  if (!needsRestore) return;

  const Preferences = await getPreferences();
  await Promise.all(
    keys.map(async (key) => {
      if (localStorage.getItem(key) !== null) return;
      const { value } = await Preferences.get({ key });
      if (value !== null) localStorage.setItem(key, value);
    }),
  );
}

export const AppStorage = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },

  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
    // Durable backup on native
    if (Capacitor.isNativePlatform()) {
      getPreferences().then((p) => p.set({ key, value }));
    }
  },

  delete(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
    if (Capacitor.isNativePlatform()) {
      getPreferences().then((p) => p.remove({ key }));
    }
  },
};
