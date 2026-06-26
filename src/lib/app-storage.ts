"use client";

import { Capacitor } from "@capacitor/core";

// In-memory cache — populated on init(), keeps sync reads fast
const _cache: Record<string, string> = {};
let _initialized = false;

async function getPreferences() {
  const { Preferences } = await import("@capacitor/preferences");
  return Preferences;
}

/**
 * Call once at app boot on native.
 * Loads all persisted keys into memory so sync reads work immediately.
 */
export async function initAppStorage(keys: string[]): Promise<void> {
  if (_initialized || !Capacitor.isNativePlatform()) {
    _initialized = true;
    return;
  }
  const Preferences = await getPreferences();
  await Promise.all(
    keys.map(async (key) => {
      const { value } = await Preferences.get({ key });
      if (value !== null) _cache[key] = value;
    }),
  );
  _initialized = true;
}

/**
 * Unified storage — Capacitor Preferences on native, cookies on web.
 * Reads are synchronous (cache). Writes are fire-and-forget async on native.
 */
export const AppStorage = {
  get(key: string): string | null {
    if (Capacitor.isNativePlatform()) {
      return _cache[key] ?? null;
    }
    // Web: read from cookie
    if (typeof document === "undefined") return null;
    const k = encodeURIComponent(key);
    const match = document.cookie.match(new RegExp(`(?:^|; )${k}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  },

  set(key: string, value: string): void {
    if (Capacitor.isNativePlatform()) {
      _cache[key] = value;
      getPreferences().then((p) => p.set({ key, value }));
      return;
    }
    // Web: write cookie (7-day expiry)
    if (typeof document === "undefined") return;
    const k = encodeURIComponent(key);
    document.cookie = `${k}=${encodeURIComponent(value)};max-age=${7 * 24 * 60 * 60};path=/;SameSite=Lax`;
  },

  delete(key: string): void {
    if (Capacitor.isNativePlatform()) {
      delete _cache[key];
      getPreferences().then((p) => p.remove({ key }));
      return;
    }
    if (typeof document === "undefined") return;
    const k = encodeURIComponent(key);
    document.cookie = `${k}=;max-age=0;path=/`;
  },
};
