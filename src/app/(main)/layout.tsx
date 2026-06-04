"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { SidebarProvider, SidebarInset } from "@/components/ui";
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" />
      {/*
        SidebarInset fills remaining flex space.
        ml-2 adds a small gap between sidebar panel edge and content area.
        bg-transparent lets the graffiti background show through.
      */}
      <SidebarInset className="bg-transparent ml-2 min-h-screen">
        <div className="flex min-h-full flex-col gap-0 p-5 md:p-7">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
