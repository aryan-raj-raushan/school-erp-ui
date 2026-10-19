"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut, X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { DrawerIconBox, DrawerLabel, DrawerChevron, DrawerCollapse, DrawerSubLink } from "@/components/ui/mobile-nav";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useNavItems } from "@/hooks/useNavItems";
import { useSchoolLogo } from "@/hooks/useSchoolLogo";
import { APP } from "@/constants";
import type { NavItemConfig } from "@/types/layout/app-sidebar";

const TINT = "color-mix(in srgb, var(--theme-gradient-from) 20%, transparent)";
const GRADIENT = "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))";

function IconBox({ icon: Icon, active }: { icon: NavItemConfig["icon"]; active: boolean }) {
  return (
    <DrawerIconBox active={active} style={active ? { background: GRADIENT, color: "var(--theme-active-text)" } : undefined}>
      <Icon size={18} />
    </DrawerIconBox>
  );
}

function DrawerSection({
  item,
  isActive,
  isOpen,
  onToggle,
  onNavigate,
}: {
  item: NavItemConfig;
  isActive: (url: string) => boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const children = item.items ?? [];

  if (children.length === 0) {
    const active = isActive(item.url);
    return (
      <Link
        href={item.url}
        onClick={onNavigate}
        className="flex min-h-12 items-center gap-3 rounded-2xl px-2 py-1.5 active:bg-muted"
        style={active ? { background: TINT } : undefined}
      >
        <IconBox icon={item.icon} active={active} />
        <DrawerLabel active={active}>{item.title}</DrawerLabel>
      </Link>
    );
  }

  const sectionActive = children.some((c) => isActive(c.url));
  return (
    <div className="rounded-2xl">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left active:bg-muted"
      >
        <IconBox icon={item.icon} active={sectionActive} />
        <DrawerLabel active={sectionActive}>{item.title}</DrawerLabel>
        <DrawerChevron open={isOpen} />
      </button>

      <DrawerCollapse open={isOpen}>
        <div className="overflow-hidden">
          <ul className="ml-[26px] mt-0.5 mb-1.5 flex flex-col gap-0.5 border-l border-border pl-3">
            {children.map((sub) => {
              const active = isActive(sub.url);
              return (
                <li key={sub.url}>
                  <DrawerSubLink
                    href={sub.url}
                    onClick={onNavigate}
                    active={active}
                    style={active ? { background: TINT, color: "var(--foreground)" } : undefined}
                  >
                    <span className="truncate">{sub.title}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--theme-gradient-from)" }} />
                    )}
                  </DrawerSubLink>
                </li>
              );
            })}
          </ul>
        </div>
      </DrawerCollapse>
    </div>
  );
}

export function MobileDrawer() {
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const brand = useSchoolLogo();
  const { user, userInfo, logout } = useDashboardLayout();
  const { navMain, navSecondary, isActive } = useNavItems();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const close = () => setOpenMobile(false);
  const toggle = (title: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  const role = (user?.role ?? "").replace(/_/g, " ").toLowerCase();

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent
        side="left"
        showCloseButton={false}
        data-native-chrome
        className="gap-0 overflow-hidden rounded-r-[28px] border-0 bg-background"
        style={{ width: "min(88vw, 340px)", maxWidth: "none", padding: 0 }}
      >
        <SheetPrimitive.Title className="sr-only">Navigation menu</SheetPrimitive.Title>
        <SheetPrimitive.Description className="sr-only">App navigation</SheetPrimitive.Description>

        <div
          className="relative shrink-0 px-5 pb-5"
          style={{
            background: "linear-gradient(180deg, var(--theme-gradient-from) 0, var(--theme-gradient-from) var(--sat, 0px), var(--theme-gradient-to) 100%)",
            color: "var(--theme-active-text)",
            paddingTop: "calc(var(--sat, 0px) + 16px)",
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 active:bg-white/40"
            style={{ top: "calc(var(--sat, 0px) + 10px)" }}
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 pr-10">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/30">
              {brand?.logo_url ? (
                <Image src={brand.logo_url} alt={brand.name} width={32} height={32} className="h-full w-full object-cover" unoptimized />
              ) : (
                <GraduationCap size={16} />
              )}
            </span>
            <span className="truncate text-sm font-semibold">{brand?.name ?? APP.name}</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Avatar className="size-14 ring-2 ring-white/50">
              <AvatarFallback className="text-lg font-semibold">{userInfo.initials || "U"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight">{userInfo.fullName || "Welcome"}</p>
              <p className="truncate text-xs opacity-75">{userInfo.email}</p>
              {role && (
                <span className="mt-1.5 inline-block rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  {role}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
          <div className="flex flex-col gap-0.5">
            {navMain.map((item) => (
              <DrawerSection
                key={item.title}
                item={item}
                isActive={isActive}
                isOpen={!collapsed.has(item.title)}
                onToggle={() => toggle(item.title)}
                onNavigate={close}
              />
            ))}
          </div>

          {navSecondary.length > 0 && (
            <>
              <p className="px-2 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">System</p>
              <div className="flex flex-col gap-0.5">
                {navSecondary.map((item) => (
                  <DrawerSection
                    key={item.title}
                    item={item}
                    isActive={isActive}
                    isOpen={!collapsed.has(item.title)}
                    onToggle={() => toggle(item.title)}
                    onNavigate={close}
                  />
                ))}
              </div>
            </>
          )}
        </nav>

        <div className="shrink-0 border-t border-border px-3 pt-3" style={{ paddingBottom: "calc(var(--sab, 0px) + 12px)" }}>
          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-rose-600 active:bg-rose-500/10 dark:text-rose-400"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
              <LogOut size={18} />
            </span>
            <span className="text-[15px] font-medium">Log out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
