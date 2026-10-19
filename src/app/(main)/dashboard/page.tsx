"use client";

import { useDashboardVariant } from "@/hooks/useDashboardShared";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { TeacherDashboard } from "./TeacherDashboard";
import { SchoolAdminDashboard } from "./SchoolAdminDashboard";

export default function DashboardPage() {
  const variant = useDashboardVariant();

  if (variant === "platform") return <SuperAdminDashboard />;
  if (variant === "teacher") return <TeacherDashboard />;
  return <SchoolAdminDashboard />;
}
