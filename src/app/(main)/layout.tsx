"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES, STORAGE_KEYS } from "@/constants";
import { AuthContext } from "@/types";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { initAppStorage } from "@/lib/app-storage";
import { SidebarProvider } from "@/components/ui";
import { RouteGuard } from "@/components/layout/RouteGuard";
import dynamic from "next/dynamic";

const NavigationProgress = dynamic(
  () => import("@/components/layout/NavigationProgress").then((m) => m.NavigationProgress),
  { ssr: false },
);

const AppSidebar = dynamic(
  () => import("@/components/layout/AppSidebar").then((m) => m.AppSidebar),
  { ssr: false },
);

const AppHeader = dynamic(
  () => import("@/components/layout/AppHeader").then((m) => m.AppHeader),
  { ssr: false },
);

const MobileHeader = dynamic(
  () => import("@/components/layout/MobileHeader").then((m) => m.MobileHeader),
  { ssr: false },
);

const MobileTabBar = dynamic(
  () => import("@/components/layout/MobileTabBar").then((m) => m.MobileTabBar),
  { ssr: false },
);

const RestrictionBanner = dynamic(
  () => import("@/components/layout/RestrictionBanner").then((m) => m.RestrictionBanner),
  { ssr: false },
);

const ALL_STORAGE_KEYS = [
  STORAGE_KEYS.accessToken,
  STORAGE_KEYS.refreshToken,
  STORAGE_KEYS.context,
  STORAGE_KEYS.isAuthenticated,
  STORAGE_KEYS.user,
  "auth:permissions",
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // On cold start (native): restore from Preferences into localStorage if needed,
    // then check auth. localStorage reads are sync so no blank screen.
    initAppStorage(ALL_STORAGE_KEYS).then(() => {
      if (!TokenStorage.isAuthenticated()) {
        router.replace(ROUTES.login);
      } else if (TokenStorage.getContext() === AuthContext.PARENT) {
        router.replace(ROUTES.parentPortal);
      }
    });
  }, [router]);

  return (
    <SidebarProvider>
      <NavigationProgress />
      <AppSidebar />
      <div
        className="md:pt-[var(--sat)] md:pb-[var(--sab)]"
        style={{
          flex: 1,
          height: "100dvh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div className="hidden md:block">
          <AppHeader />
        </div>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <RestrictionBanner />
        <main style={{ flex: 1, overflow: "auto" }}>
          <div
            key={pathname}
            className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-7 pt-0 page-enter"
            style={{ minHeight: "100%" }}
          >
            <RouteGuard>{children}</RouteGuard>
          </div>
        </main>
        <div className="md:hidden">
          <MobileTabBar />
        </div>
      </div>
    </SidebarProvider>
  );
}
