import { Capacitor } from "@capacitor/core";

/** Open a URL in the in-app browser on native, or a new tab on web. */
export async function openExternal(url: string) {
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
