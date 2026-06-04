"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOut, MoreHorizontal } from "lucide-react";
import { NavTooltip } from "../ui/nav-tooltip";

interface UserInfo {
  fullName: string;
  initials: string;
  email: string;
  avatar?: string;
}

interface NavUserProps {
  userInfo: UserInfo;
  logout: () => void;
  isLoading?: boolean;
  isCollapsed?: boolean;
}

export function NavUser({ userInfo, logout, isCollapsed = false }: NavUserProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div style={{ position: "relative" }}>
              <NavTooltip
                label={userInfo.fullName || "Account"}
                side="right"
                disabled={!isCollapsed}
              >
                <SidebarMenuButton
                  size="lg"
                  style={isCollapsed
                    ? { width: 40, padding: 0, justifyContent: "center", gap: 0, margin: "0 auto", display: "flex", alignItems: "center" }
                    : undefined}
                >
                  <Avatar>
                    <AvatarImage src={userInfo?.avatar} alt={userInfo.fullName} />
                    <AvatarFallback>{userInfo?.initials}</AvatarFallback>
                  </Avatar>

                  {!isCollapsed && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {userInfo.fullName}
                        </span>
                        <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.6 }}>
                          {userInfo?.email}
                        </span>
                      </div>
                      <span style={{ marginLeft: "auto", flexShrink: 0, display: "flex" }}>
                        <MoreHorizontal size={15} />
                      </span>
                    </>
                  )}
                </SidebarMenuButton>
              </NavTooltip>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar>
                  <AvatarImage src={userInfo?.avatar} alt={userInfo?.fullName} />
                  <AvatarFallback>{userInfo.initials}</AvatarFallback>
                </Avatar>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span>{userInfo?.fullName}</span>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>{userInfo?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout}>
              <LogOut size={14} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
