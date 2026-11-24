"use client";

import { Headset, Mail, Phone } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SchoolSupportContact } from "@/types";

export function useSchoolSupport(): SchoolSupportContact | null {
  return useAuthStore((s) => s.user?.school?.support ?? null);
}

function telHref(support: SchoolSupportContact) {
  return `tel:${support.dial_code}${support.phone}`;
}

function SupportLines({ support, className }: { support: SchoolSupportContact; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {support.phone && (
        <a href={telHref(support)} className="flex min-w-0 items-center gap-2 text-xs font-medium hover:underline">
          <Phone size={13} className="shrink-0 text-primary" />
          <span className="truncate">
            {support.dial_code} {support.phone}
          </span>
        </a>
      )}
      {support.email && (
        <a href={`mailto:${support.email}`} className="flex min-w-0 items-center gap-2 text-xs font-medium hover:underline">
          <Mail size={13} className="shrink-0 text-primary" />
          <span className="truncate">{support.email}</span>
        </a>
      )}
    </div>
  );
}

export function SupportContactCard({ isCollapsed }: { isCollapsed: boolean }) {
  const support = useSchoolSupport();
  if (!support) return null;

  if (isCollapsed) {
    return (
      <a
        href={support.phone ? telHref(support) : `mailto:${support.email}`}
        title={`Support${support.name ? ` — ${support.name}` : ""}`}
        className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
      >
        <Headset size={18} />
      </a>
    );
  }

  return (
    <div className="mx-3 mb-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Headset size={13} className="text-primary" /> Need help?
      </p>
      {support.name && <p className="mt-1 truncate text-sm font-semibold">{support.name}</p>}
      <SupportLines support={support} className="mt-1" />
    </div>
  );
}

export function SupportContactChip() {
  const support = useSchoolSupport();
  if (!support) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-1.5 text-xs font-medium hover:bg-muted md:flex"
        >
          <Headset size={15} className="text-primary" />
          <span className="max-w-[180px] truncate">
            {support.phone ? `${support.dial_code} ${support.phone}` : support.email}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support</p>
        {support.name && <p className="mt-1 text-sm font-semibold">{support.name}</p>}
        <SupportLines support={support} className="mt-2 gap-2" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SupportContactPanel({ className }: { className?: string }) {
  const support = useSchoolSupport();
  if (!support) return null;

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border border-border bg-card px-3 py-3", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Headset size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">Need help?{support.name ? ` ${support.name}` : ""}</p>
        <SupportLines support={support} className="mt-1" />
      </div>
    </div>
  );
}
