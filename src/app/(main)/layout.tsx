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
      <main style={{ flex: 1, minHeight: "100vh", overflow: "auto" }}>
        <div style={{ padding: "20px 28px", minHeight: "100%" }}>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
