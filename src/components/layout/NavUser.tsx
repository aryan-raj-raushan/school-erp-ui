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
import { MoreHorizontal, LogOut, Moon, Sun } from "lucide-react";
import { Icon } from "../ui/icon";
import { Div } from "../ui";
import { useThemeStore } from "@/store/theme.store";

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
}

export function NavUser({ userInfo, logout }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { mode, toggleMode } = useThemeStore();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar>
                <AvatarImage src={userInfo?.avatar} alt={userInfo.fullName} />
                <AvatarFallback>{userInfo?.initials}</AvatarFallback>
              </Avatar>
              <Div wrap={true}>
                <span>{userInfo.fullName}</span>
                <span>{userInfo?.email}</span>
              </Div>
              <Icon icon={MoreHorizontal} className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel>
              <Div type="row" align="center" justify="center">
                <Avatar>
                  <AvatarImage
                    src={userInfo?.avatar}
                    alt={userInfo?.fullName}
                  />
                  <AvatarFallback>{userInfo.initials}</AvatarFallback>
                </Avatar>

                <Div type="col">
                  <span>{userInfo?.fullName}</span>
                  <span>{userInfo?.email}</span>
                </Div>
              </Div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={toggleMode}>
              <Icon icon={mode === "light" ? Moon : Sun} />
              {mode === "light" ? "Dark mode" : "Light mode"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout}>
              <Icon icon={LogOut} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
