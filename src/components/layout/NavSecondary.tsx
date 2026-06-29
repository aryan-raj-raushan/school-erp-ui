"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
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

const SUB_SPRING = { type: "spring" as const, stiffness: 300, damping: 28 };

const collapsedBtn: React.CSSProperties = {
  width: 38,
  padding: 0,
  justifyContent: "center",
  gap: 0,
  margin: "0 auto",
};

const labelStyle = (isCollapsed: boolean): React.CSSProperties => ({
  opacity: isCollapsed ? 0 : 1,
  maxWidth: isCollapsed ? 0 : "200px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  flex: isCollapsed ? "none" : 1,
  transition: "opacity 0.15s ease, max-width 0.22s ease",
  display: "block",
});

const chevronStyle = (isOpen: boolean): React.CSSProperties => ({
  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease",
  flexShrink: 0,
  display: "flex",
});

interface NavSecondaryProps {
  items: NavItemConfig[];
  isCollapsed: boolean;
}

export function NavSecondary({ items, isCollapsed }: NavSecondaryProps) {
  const pathname = usePathname();

  const initialOpen =
    items.find((item) =>
      item.items?.some((sub) => pathname.startsWith(sub.url)),
    )?.title ?? null;

  const [openItem, setOpenItem] = useState<string | null>(initialOpen);

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
          {items.map((item) => {
            const hasChildren = !!item.items?.length;

            const isParentActive = hasChildren
              ? (item.items?.some((sub) => pathname.startsWith(sub.url)) ?? false)
              : pathname.startsWith(item.url ?? "");

            const isOpen =
              openItem === item.title ||
              (isParentActive && openItem === null);

            return (
              <SidebarMenuItem key={item.title}>
                <div style={{ position: "relative" }}>
                  <NavTooltip
                    label={item.title}
                    side="right"
                    disabled={!isCollapsed}
                  >
                    {hasChildren ? (
                      isCollapsed ? (
                        <SidebarMenuButton
                          asChild
                          isActive={isParentActive}
                          style={collapsedBtn}
                        >
                          <Link href={item.items![0].url}>
                            <item.icon />
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          isActive={isParentActive}
                          onClick={() => setOpenItem(isOpen ? null : item.title)}
                        >
                          <item.icon />
                          <span style={labelStyle(false)}>{item.title}</span>
                          <span style={chevronStyle(isOpen)}>
                            <ChevronRight size={14} />
                          </span>
                        </SidebarMenuButton>
                      )
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.url ?? "")}
                        style={isCollapsed ? collapsedBtn : undefined}
                      >
                        <Link href={item.url ?? "#"}>
                          <item.icon />
                          <span style={labelStyle(isCollapsed)}>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </NavTooltip>

                  {hasChildren && (
                    <AnimatePresence initial={false}>
                      {isOpen && !isCollapsed && (
                        <motion.div
                          key="submenu"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ ...SUB_SPRING, duration: 0.22 }}
                          style={{ overflow: "hidden" }}
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
