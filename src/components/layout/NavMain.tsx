"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
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
import { Div } from "../ui";

export function NavMain({ items }: { items: NavItemConfig[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <Div type="col" gap="sm">
          <SidebarMenu>
            <SidebarMenuItem>
              <Div type="row" gap="sm" align="center">
                <SidebarMenuButton tooltip="dashboard" variant="sidebar">
                  <Link href={"/dashboard"}>
                    <Div type="row" gap="sm" align="center">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Div>
                  </Link>
                </SidebarMenuButton>
              </Div>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenu>
              {items.map((item: NavItemConfig) => {
                const hasChildren = item.items?.length;

                if (hasChildren) {
                  return (
                    <Collapsible
                      key={item.title}
                      // defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>

                            <Icon icon={ChevronRight} type="chevron-icon" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenu>
                            {item.items?.map((subItem) => (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton asChild>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarMenu>
        </Div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
