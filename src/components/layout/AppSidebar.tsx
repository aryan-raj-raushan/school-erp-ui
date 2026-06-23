"use client";

import { motion } from "framer-motion";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";
import {
  APP_NAV_MAIN,
  APP_NAV_SECONDARY,
} from "@/constants/layout/app-sidebar.constants";
import { APP } from "@/constants";
import { useAuthStore } from "@/store/auth.store";

const EXPANDED_W = 272;
const ICON_W = 76;
const SPRING = { type: "spring" as const, stiffness: 280, damping: 26, mass: 0.9 };

export function AppSidebar() {
  const { state } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const isCollapsed = state === "collapsed";

  const visibleMain = APP_NAV_MAIN
    .map((item) => {
      // Filter sub-items by their own permissions
      if (!item.items?.length) return item;
      const visibleItems = item.items.filter(
        (sub) => !sub.permissions || sub.permissions.some((p) => permissions.includes(p)),
      );
      return { ...item, items: visibleItems };
    })
    .filter((item) => {
      const roleOk = !item.roles || (user?.role && item.roles.includes(user.role));
      const permOk = !item.permissions || item.permissions.some((p) => permissions.includes(p));
      // Hide parent if it has sub-items defined but all were filtered out
      const hasVisibleChildren = !item.items || item.items.length > 0;
      return roleOk && permOk && hasVisibleChildren;
    });
  const visibleSecondary = APP_NAV_SECONDARY.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  return (
    <motion.aside
      animate={{ width: isCollapsed ? ICON_W : EXPANDED_W }}
      transition={SPRING}
      style={{
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 40,
        overflow: "visible",
      }}
    >
      {/* Glass floating panel — fixed inner width so content doesn't rewrap */}
      <motion.div
        data-sidebar-collapsed={isCollapsed}
        animate={{ width: isCollapsed ? ICON_W - 16 : EXPANDED_W - 16 }}
        transition={SPRING}
        style={{
          margin: "10px 8px",
          height: "calc(100vh - 20px)",
          background: "var(--glass-bg)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          border: "1px solid var(--glass-border)",
          borderRadius: 18,
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.20)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Gradient accent bar ──────────────────── */}
        <div
          style={{
            height: 3,
            background:
              "linear-gradient(90deg, var(--theme-gradient-from), var(--theme-gradient-to))",
            flexShrink: 0,
          }}
        />

        {/* ── Header ──────────────────────────────── */}
        <div
          style={{
            borderBottom: "1px solid var(--glass-border)",
            flexShrink: 0,
            padding: isCollapsed ? "0 4px" : "0 10px",
            transition: "padding 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isCollapsed ? "10px 4px" : "8px 2px",
              minHeight: 52,
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
                overflow: "hidden",
                textDecoration: "none",
                width: "100%",
              }}
            >
              <motion.div
                animate={{ scale: isCollapsed ? 1.05 : 1 }}
                transition={SPRING}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))",
                  boxShadow: "0 4px 14px var(--theme-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "var(--theme-active-text)",
                }}
              >
                <GraduationCap size={18} />
              </motion.div>

              <div
                style={{
                  overflow: "hidden",
                  opacity: isCollapsed ? 0 : 1,
                  maxWidth: isCollapsed ? 0 : "200px",
                  transition: "opacity 0.15s ease, max-width 0.22s ease",
                  minWidth: 0,
                  flexShrink: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--foreground)",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {APP.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  ERP Platform
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Nav content ─────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
          }}
        >
          <NavMain items={visibleMain} isCollapsed={isCollapsed} />

          {/* Secondary pushed to bottom */}
          <div style={{ marginTop: "auto" }}>
            <NavSecondary items={visibleSecondary} isCollapsed={isCollapsed} />
          </div>
        </div>

      </motion.div>
    </motion.aside>
  );
}
