import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";

import { SquareArrowUpRight } from "lucide-react";
import Link from "next/link";
import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";
import {
  APP_NAV_MAIN,
  APP_NAV_SECONDARY,
  APP_NAV_USER,
} from "@/constants/layout/app-sidebar.constants";
import { useAuthStore } from "@/store/auth.store";
import { APP } from "@/constants";
import { H1 } from "../ui";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user);

  const VISIBLE_NAV_MAIN = APP_NAV_MAIN.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  const VISIBLE_NAV_SECONDARY = APP_NAV_SECONDARY.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <SquareArrowUpRight />
                <H1>{APP.name}</H1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={VISIBLE_NAV_MAIN} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={VISIBLE_NAV_SECONDARY} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
