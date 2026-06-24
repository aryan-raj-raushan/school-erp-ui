"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { SidebarProvider } from "@/components/ui";
import dynamic from "next/dynamic";

const AppSidebar = dynamic(
  () => import("@/components/layout/AppSidebar").then((m) => m.AppSidebar),
  { ssr: false },
);

const AppHeader = dynamic(
  () => import("@/components/layout/AppHeader").then((m) => m.AppHeader),
  { ssr: false },
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!TokenStorage.isAuthenticated()) {
      router.replace(ROUTES.login);
    }
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div
        style={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <AppHeader />
        <main style={{ flex: 1, overflow: "auto" }}>
          <div className="p-4 sm:p-5 md:px-7 md:py-5" style={{ minHeight: "100%" }}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
