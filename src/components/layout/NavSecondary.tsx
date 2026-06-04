"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavItemConfig } from "@/types/layout/app-sidebar";
import { NavTooltip } from "../ui/nav-tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";

const collapsedBtn: React.CSSProperties = {
  width: 38,
  padding: 0,
  justifyContent: "center",
  gap: 0,
  margin: "0 auto",
};

interface NavSecondaryProps {
  items: NavItemConfig[];
  isCollapsed: boolean;
}

export function NavSecondary({ items, isCollapsed }: NavSecondaryProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <div
        style={{
          overflow: "hidden",
          height: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1,
          transition: "opacity 0.15s ease, height 0.2s ease",
        }}
      >
        <SidebarGroupLabel>System</SidebarGroupLabel>
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <div style={{ position: "relative" }}>
                <NavTooltip
                  label={item.title}
                  side="right"
                  disabled={!isCollapsed}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                    style={isCollapsed ? collapsedBtn : undefined}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span
                        style={{
                          opacity: isCollapsed ? 0 : 1,
                          maxWidth: isCollapsed ? 0 : "200px",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          display: "block",
                          transition: "opacity 0.15s ease, max-width 0.22s ease",
                        }}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </NavTooltip>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
