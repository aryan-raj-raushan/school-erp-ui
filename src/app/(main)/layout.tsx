"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { SidebarProvider, SidebarInset, Div } from "@/components/ui";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    // user,
    pathname,
    navItems,
    logout,
    isLoading,
    isCollapsed,
    toggleSidebar,
  } = useDashboardLayout();

  useEffect(() => {
    if (!TokenStorage.isAuthenticated()) {
      router.replace(ROUTES.login);
    }
  }, [router]);

  return (
    // <DashboardShell>
    //   <Sidebar collapsed={isCollapsed}>
    //     <SidebarHeader>
    //       {!isCollapsed && <SidebarBrand>{APP.name}</SidebarBrand>}
    //       <SidebarToggle collapsed={isCollapsed} onToggle={toggleSidebar} />
    //     </SidebarHeader>

    //     <Nav>
    //       {navItems.map((item) => (
    //         <NavItem
    //           key={item.href}
    //           href={item.href}
    //           active={pathname === item.href}
    //           icon={NAV_ICONS[item.iconKey]}
    //           collapsed={isCollapsed}
    //         >
    //           {item.label}
    //         </NavItem>
    //       ))}
    //     </Nav>

    //     <SidebarFooter>
    //       <ThemeToggle collapsed={isCollapsed} />
    //       <SidebarUserInfo collapsed={isCollapsed}>
    //         <H3 color="default">
    //           {user?.first_name} {user?.last_name}
    //         </H3>
    //         <P color="muted">{user?.role}</P>
    //       </SidebarUserInfo>
    //       <NavButton
    //         icon={<LogOut size={18} />}
    //         collapsed={isCollapsed}
    //         onClick={logout}
    //         disabled={isLoading}
    //       >
    //         {NAV_LABELS.signOut}
    //       </NavButton>
    //     </SidebarFooter>
    //   </Sidebar>

    //   <DashboardMain>{children}</DashboardMain>
    // </DashboardShell>
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
