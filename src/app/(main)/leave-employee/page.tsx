"use client";

import { useAuthStore } from "@/store/auth.store";
import { Role } from "@/types";
import AdminLeaveView from "./_views/AdminLeaveView";
import TeacherLeaveView from "./_views/TeacherLeaveView";

const ADMIN_STAFF_ROLES = ['SCHOOL_ADMIN', 'PRINCIPAL'];

export default function LeavePage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const staffRole = (user as { staff_role?: string } | null)?.staff_role;

  const isAdmin =
    role === Role.SCHOOL_ADMIN ||
    (role === Role.TEACHER && !!staffRole && ADMIN_STAFF_ROLES.includes(staffRole));

  if (isAdmin) return <AdminLeaveView />;
  return <TeacherLeaveView />;
}
