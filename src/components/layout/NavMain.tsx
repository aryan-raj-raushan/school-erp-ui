"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
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

const SUB_SPRING = { type: "spring" as const, stiffness: 300, damping: 28 };

const collapsedBtn: React.CSSProperties = {
  width: 38,
  padding: 0,
  justifyContent: "center",
  gap: 0,
  margin: "0 auto",
};

interface NavMainProps {
  items: NavItemConfig[];
  isCollapsed: boolean;
}

/** CSS fade + collapse — opacity+maxWidth so text takes zero space when hidden */
const labelStyle = (isCollapsed: boolean): React.CSSProperties => ({
  opacity: isCollapsed ? 0 : 1,
  maxWidth: isCollapsed ? 0 : "200px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  flex: isCollapsed ? "none" : 1,
  transition: "opacity 0.15s ease, max-width 0.22s ease",
  display: "block",
});

const chevronStyle = (isCollapsed: boolean, isOpen: boolean): React.CSSProperties => ({
  opacity: isCollapsed ? 0 : 1,
  maxWidth: isCollapsed ? 0 : "20px",
  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
  transition: "opacity 0.15s ease, max-width 0.22s ease, transform 0.2s ease",
  flexShrink: 0,
  display: "flex",
  overflow: "hidden",
});

export function NavMain({ items, isCollapsed }: NavMainProps) {
  const pathname = usePathname();

  const initialOpen =
    items.find((item) =>
      item.items?.some((sub) => pathname.startsWith(sub.url)),
    )?.title ?? null;

  const [openItem, setOpenItem] = useState<string | null>(initialOpen);

  return (
    <SidebarGroup>
      {/* Group label — CSS height+opacity collapse, no Framer */}
      <div
        style={{
          overflow: "hidden",
          height: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1,
          transition: "opacity 0.15s ease, height 0.2s ease",
        }}
      >
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
                        /* Collapsed: act as link to first child */
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
                          <span style={chevronStyle(false, isOpen)}>
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

                  {/* Sub-menu — keep Framer for height animation only */}
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
