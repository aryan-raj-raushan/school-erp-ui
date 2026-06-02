"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { SidebarProvider, SidebarInset, Div } from "@/components/ui";
import { AppSidebar } from "@/components/layout/AppSidebar";

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
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="">
        {/* <SiteHeader /> */}
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
