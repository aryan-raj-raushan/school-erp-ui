import { APP } from "@/constants";
import { openExternal } from "@/lib/external-link";

export function whatsappUrl(phone: string, dialCode = "+91", message?: string) {
  const digits = `${dialCode}${phone}`.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function openWhatsApp(phone: string, dialCode = "+91", message?: string) {
  return openExternal(whatsappUrl(phone, dialCode, message));
}

export function credentialsMessage(name: string, loginId: string, password: string) {
  return [
    `Hello ${name},`,
    `Your ${APP.name} login is ready.`,
    `Login ID: ${loginId}`,
    `Temporary password: ${password}`,
    "You will be asked to set a new password after your first login.",
  ].join("\n");
}
