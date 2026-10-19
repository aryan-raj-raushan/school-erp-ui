import { Capacitor } from "@capacitor/core";

/** True inside the Capacitor (iOS / Android) app; false in a normal browser. */
export const isNativeApp = () => Capacitor.isNativePlatform();
