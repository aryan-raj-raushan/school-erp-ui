import { Capacitor } from "@capacitor/core";

type HapticKind = "light" | "medium" | "success" | "warning";

/** Fire-and-forget haptic tick. No-op on web and when the plugin is unavailable. */
export async function haptic(kind: HapticKind = "light") {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import(
      "@capacitor/haptics"
    );
    if (kind === "success") {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (kind === "warning") {
      await Haptics.notification({ type: NotificationType.Warning });
    } else {
      await Haptics.impact({
        style: kind === "medium" ? ImpactStyle.Medium : ImpactStyle.Light,
      });
    }
  } catch {
    // haptics are a nicety — never surface failures
  }
}
