"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavItemConfig } from "@/types/layout/app-sidebar";
import Link from "next/link";
import { Icon } from "../ui/icon";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavMain({ items }: { items: NavItemConfig[] }) {
  const pathname = usePathname();

  /* Initialize open to whichever parent contains the active route */
  const initialOpen =
    items.find((item) =>
      item.items?.some((sub) => pathname.startsWith(sub.url)),
    )?.title ?? null;

  const [openItem, setOpenItem] = useState<string | null>(initialOpen);

  const isDashboardActive =
    pathname === "/dashboard" || pathname === "/";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarGroupContent>

        {/* Dashboard shortcut */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Dashboard"
              isActive={isDashboardActive}
              asChild
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Main items */}
        <SidebarMenu>
          {items.map((item: NavItemConfig) => {
            const hasChildren = !!item.items?.length;

            const isParentActive = hasChildren
              ? (item.items?.some((sub) => pathname.startsWith(sub.url)) ?? false)
              : pathname.startsWith(item.url ?? "");

            /* Accordion — only one open at a time */
            const isOpen =
              openItem === item.title ||
              (isParentActive && openItem === null);

            if (hasChildren) {
              return (
                <SidebarMenuItem key={item.title}>
                  <Collapsible
                    className="group/collapsible"
                    open={isOpen}
                    onOpenChange={(open) =>
                      setOpenItem(open ? item.title : null)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isParentActive}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <Icon
                          icon={ChevronRight}
                          type="chevron-icon"
                          className={
                            isOpen
                              ? "rotate-90 transition-transform duration-200"
                              : "transition-transform duration-200"
                          }
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenu childrenItem>
                        {item.items?.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname.startsWith(subItem.url)}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={pathname.startsWith(item.url ?? "")}
                >
                  <Link href={item.url ?? "#"}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

      </SidebarGroupContent>
    </SidebarGroup>
  );
}
