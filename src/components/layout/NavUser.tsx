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
import { Icon } from "../ui/icon";
import { Div } from "../ui";

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
                  <AvatarImage src={userInfo?.avatar} alt={userInfo?.fullName} />
                  <AvatarFallback>{userInfo.initials}</AvatarFallback>
                </Avatar>
                <Div type="col">
                  <span>{userInfo?.fullName}</span>
                  <span>{userInfo?.email}</span>
                </Div>
              </Div>
            </DropdownMenuLabel>

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
