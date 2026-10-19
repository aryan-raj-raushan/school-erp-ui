"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Menu, Search } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useNavItems } from "@/hooks/useNavItems";
import { useSchoolLogo } from "@/hooks/useSchoolLogo";
import { APP } from "@/constants";
import { MobileSearchSheet } from "./MobileSearchSheet";

export function MobileHeader() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { userInfo } = useDashboardLayout();
  const { pageTitle, isTabRoot } = useNavItems();
  const brand = useSchoolLogo();
  const [searchOpen, setSearchOpen] = useState(false);

  const isHome = isTabRoot || !pageTitle;
  const title = isTabRoot && pageTitle ? pageTitle : (pageTitle ?? brand?.name ?? APP.name);
  const subtitle = isHome ? (brand?.name ?? APP.name) : null;

  const btn = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 active:bg-white/45";

  return (
    <>
      <header
        data-native-chrome
        className="flex shrink-0 items-center gap-2 px-3"
        style={{
          background: "linear-gradient(180deg, var(--theme-gradient-from) 0, var(--theme-gradient-from) var(--sat, 0px), var(--theme-gradient-to) 100%)",
          color: "var(--theme-active-text)",
          height: "calc(56px + var(--sat, 0px))",
          paddingTop: "var(--sat, 0px)",
          boxShadow: "0 4px 18px -6px var(--theme-glow)",
        }}
      >
        {isHome ? (
          <button type="button" onClick={toggleSidebar} aria-label="Open menu" className={btn}>
            <Menu size={20} />
          </button>
        ) : (
          <button type="button" onClick={() => router.back()} aria-label="Go back" className={btn}>
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="min-w-0 flex-1 px-1">
          <h1 className="truncate text-[17px] font-bold leading-tight">{title}</h1>
          {subtitle && title !== subtitle && (
            <p className="truncate text-[11px] leading-tight opacity-70">{subtitle}</p>
          )}
        </div>

        <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className={btn}>
          <Search size={19} />
        </button>
        {!isHome && (
          <button type="button" onClick={toggleSidebar} aria-label="Open menu" className={btn}>
            <Menu size={20} />
          </button>
        )}
        {isHome && (
          <button type="button" onClick={toggleSidebar} aria-label="Account" className="shrink-0 rounded-full active:opacity-70">
            <Avatar className="size-10 ring-2 ring-white/50">
              <AvatarFallback className="text-sm font-semibold">{userInfo.initials || "U"}</AvatarFallback>
            </Avatar>
          </button>
        )}
      </header>

      <MobileSearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
