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
import { MoreHorizontal, Bell, LogOut } from "lucide-react";
import { Icon } from "../ui/icon";
import { Div } from "../ui";

export function NavUser({ user }: { user: any }) {
  const { isMobile } = useSidebar();

  console.log("User: ", user);

  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar>
                <AvatarImage src={user.avatar} alt={fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <Div wrap={true}>
                <span>{fullName}</span>
                <span>{user.email}</span>
              </Div>
              <Icon icon={MoreHorizontal} className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <Div type="row" align="center" justify="center">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={fullName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <Div type="col">
                  <span>{fullName}</span>
                  <span>{user.email}</span>
                </Div>
              </Div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Icon icon={LogOut} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
