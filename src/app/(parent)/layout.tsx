"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ROUTES, STORAGE_KEYS, APP } from "@/constants";
import { AuthContext } from "@/types";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { initAppStorage } from "@/lib/app-storage";
import { useAuth } from "@/hooks/useAuth";
import { useParentChildren } from "@/hooks/useParentChildren";
import { PARENT_NAV_TABS } from "@/constants/layout/app-parent-nav.constants";
import { Div, P, Button, ResponsiveSelect } from "@/components/ui";
import { cn } from "@/lib/utils";

const ALL_STORAGE_KEYS = [
  STORAGE_KEYS.accessToken,
  STORAGE_KEYS.refreshToken,
  STORAGE_KEYS.context,
  STORAGE_KEYS.isAuthenticated,
  STORAGE_KEYS.user,
  "auth:permissions",
  "parent:children",
  "parent:active_student_id",
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isLoading: isLoggingOut } = useAuth();
  const { activeChild, activeStudentId, children: linkedChildren, hasMultipleChildren, switchTo, isSwitching } = useParentChildren();

  useEffect(() => {
    initAppStorage(ALL_STORAGE_KEYS).then(() => {
      if (!TokenStorage.isAuthenticated() || TokenStorage.getContext() !== AuthContext.PARENT) {
        router.replace(ROUTES.login);
      }
    });
  }, [router]);

  return (
    <div style={{ minHeight: "100dvh" }} className="flex flex-col">
      {/* Gradient bleeds up through the status-bar safe area so there's no
          bare strip above the header on native (Capacitor) screens. */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "linear-gradient(180deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)",
          paddingTop: "env(safe-area-inset-top)",
          boxShadow: "0 4px 24px var(--theme-glow)",
        }}
      >
        <Div type="row" align="center" justify="between" className="px-4 py-3 gap-3">
          <Div type="col" gap="xs" className="min-w-0">
            <P className="text-xs leading-none" style={{ color: "var(--theme-active-text)", opacity: 0.75 }}>
              {APP.name} · Parent Portal
            </P>
            <P className="font-semibold truncate" style={{ color: "var(--theme-active-text)" }}>
              {activeChild?.student_name ?? "—"}
            </P>
          </Div>

          <Div type="row" align="center" gap="sm" className="shrink-0">
            {hasMultipleChildren && (
              <ResponsiveSelect
                width="sm"
                value={activeStudentId ?? ""}
                disabled={isSwitching}
                options={linkedChildren.map((c) => ({
                  value: c.student_id,
                  label: c.class_label ? `${c.student_name} (${c.class_label})` : c.student_name,
                }))}
                onChange={(e) => switchTo(e.target.value)}
              />
            )}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => logout()}
              loading={isLoggingOut}
              aria-label="Log out"
            >
              <LogOut size={16} />
            </Button>
          </Div>
        </Div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </div>

      <Div
        type="row"
        align="center"
        justify="between"
        className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-background/95 backdrop-blur px-2 pt-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        {PARENT_NAV_TABS.map((item) => {
          const isActive = pathname === item.url;
          const Icon = item.icon;
          return (
            <button
              key={item.url}
              onClick={() => router.push(item.url)}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 rounded-lg py-1.5 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon size={20} />
              <span className="truncate max-w-[64px]">{item.title.split(" ")[0]}</span>
            </button>
          );
        })}
      </Div>
    </div>
  );
}
