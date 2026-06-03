"use client";

import { useAuthStore } from "@/store/auth.store";
import { Role } from "@/types";
import AdminLeaveView from "./_views/AdminLeaveView";
import TeacherLeaveView from "./_views/TeacherLeaveView";

export default function LeavePage() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === Role.SCHOOL_ADMIN) {
    return <AdminLeaveView />;
  }

  if (role === Role.TEACHER) {
    return <TeacherLeaveView />;
  }

  // fallback — other roles shouldn't land here normally
  return <TeacherLeaveView />;
}
