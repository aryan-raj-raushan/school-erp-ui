"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  phone?: string | null;
  dialCode?: string | null;
  message?: string;
  label?: string;
}

export function WhatsAppButton({ phone, dialCode, message, label }: WhatsAppButtonProps) {
  if (!phone) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size={label ? "sm" : "icon-xs"}
      aria-label="Message on WhatsApp"
      title="Message on WhatsApp"
      className="text-[#1DA851] hover:text-[#1DA851]"
      onClick={(e) => {
        e.stopPropagation();
        void openWhatsApp(phone, dialCode ?? "+91", message);
      }}
    >
      <MessageCircle />
      {label}
    </Button>
  );
}
