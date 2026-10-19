"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ROUTES, STORAGE_KEYS, APP } from "@/constants";
import { AuthContext } from "@/types";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { initAppStorage } from "@/lib/app-storage";
import { useAuth } from "@/hooks/useAuth";
import { useParentChildren } from "@/hooks/useParentChildren";
import { Div, P, Button, ResponsiveSelect, PullToRefresh } from "@/components/ui";
import { ParentTabBar } from "@/components/layout/ParentTabBar";

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
  const [refreshKey, setRefreshKey] = useState(0);
  const { logout, isLoading: isLoggingOut } = useAuth();
  const { activeChild, activeStudentId, children: linkedChildren, hasMultipleChildren, switchTo, isSwitching } = useParentChildren();

  useEffect(() => {
    initAppStorage(ALL_STORAGE_KEYS).then(() => {
      if (!TokenStorage.isAuthenticated() || TokenStorage.getContext() !== AuthContext.PARENT) {
        router.replace(ROUTES.login);
      }
    });
  }, [router]);

  // Pages fetch on mount, so remounting them re-runs every page's data load.
  async function refreshPage() {
    setRefreshKey((key) => key + 1);
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  return (
    <div style={{ height: "100dvh", overflow: "hidden" }} className="flex flex-col">
      {/* Gradient bleeds up through the status-bar safe area so there's no
          bare strip above the header on native (Capacitor) screens. */}
      <div
        className="z-20 shrink-0"
        style={{
          background: "linear-gradient(180deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)",
          paddingTop: "var(--sat)",
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

      <main className="flex-1 overflow-y-auto">
        <PullToRefresh onRefresh={refreshPage}>
          <div key={refreshKey}>{children}</div>
        </PullToRefresh>
      </main>

      <ParentTabBar onLogout={() => logout()} isLoggingOut={isLoggingOut} />
    </div>
  );
}
