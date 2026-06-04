import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";
import {
  APP_NAV_MAIN,
  APP_NAV_SECONDARY,
} from "@/constants/layout/app-sidebar.constants";
import { APP } from "@/constants";
import { useDashboardLayout } from "@/hooks";
import { Div } from "@/components/ui/layout";
import { H1, P } from "@/components/ui/typography";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userInfo, logout, isLoading } = useDashboardLayout();

  const VISIBLE_NAV_MAIN = APP_NAV_MAIN.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );
  const VISIBLE_NAV_SECONDARY = APP_NAV_SECONDARY.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  return (
    <Sidebar collapsible="offcanvas" variant="floating" {...props}>

      {/* ── Header ─────────────────────────────── */}
      <SidebarHeader>
        {/* Gradient accent line at top of panel */}
        <Div variant="gradient-bar" />

        {/* Logo + school name */}
        <Link href="/">
          <Div type="row" gap="sm" align="center" padding="px-3 py-3">
            <Div variant="theme-icon">
              <GraduationCap size={18} />
            </Div>
            <Div type="col" gap="none">
              <H1>{APP.name}</H1>
              <P size="xs" color="muted">ERP Platform</P>
            </Div>
          </Div>
        </Link>
      </SidebarHeader>

      {/* ── Navigation ─────────────────────────── */}
      <SidebarContent>
        <NavMain items={VISIBLE_NAV_MAIN} />

        {/* Secondary nav pushed to bottom */}
        <Div type="col" gap="sm" padding="mt-auto pb-1">
          <NavSecondary items={VISIBLE_NAV_SECONDARY} />
        </Div>
      </SidebarContent>

      {/* ── User footer ────────────────────────── */}
      <SidebarFooter>
        <NavUser userInfo={userInfo} logout={logout} isLoading={isLoading} />
      </SidebarFooter>

    </Sidebar>
  );
}
