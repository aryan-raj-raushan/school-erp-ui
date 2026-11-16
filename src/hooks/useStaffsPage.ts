"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StaffService, type StaffFilters } from "@/services/staff.service";
import { RolesService, type Role as ApiRole } from "@/services/roles.service";
import { ROUTES } from "@/constants";
import { Role } from "@/types";
import type { Staff, PaginationMeta } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import type { IssuedCredential } from "@/components/shared/CredentialsDialog";

export function useStaffsPage(initialFilters: StaffFilters = {}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin =
    user?.role === Role.SCHOOL_ADMIN || user?.role === ("PRINCIPAL" as any);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<StaffFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<ApiRole[]>([]);

  const fetchStaff = useCallback(
    async (overrideFilters?: StaffFilters) => {
      setIsLoading(true);
      try {
        const result = await StaffService.list(overrideFilters ?? filters);
        setStaffList(result.items);
        setPagination(result.pagination);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load staff",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  async function removeStaff(id: string) {
    try {
      await StaffService.remove(id);
      toast.success("Staff member deleted");
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function offboardStaff(id: string) {
    try {
      await StaffService.offboard(id);
      toast.success("Staff member offboarded");
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to offboard");
    }
  }

  async function reonboardStaff(id: string) {
    try {
      await StaffService.reonboard(id);
      toast.success("Staff member re-onboarded");
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to re-onboard");
    }
  }

  async function resetStaffPassword(staff: Staff) {
    try {
      const credentials = await StaffService.resetPassword(staff.id);
      setIssuedCredentials([
        {
          name: [staff.first_name, staff.last_name].filter(Boolean).join(" "),
          loginId: credentials.login_id,
          password: credentials.temporary_password,
          phone: staff.phone_number,
          dialCode: staff.dial_code,
        },
      ]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    }
  }

  function updateFilters(next: Partial<StaffFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  function navigateToNew() {
    router.push(ROUTES.staffNew);
  }
  function navigateToView(id: string) {
    router.push(ROUTES.staffView(id));
  }
  function navigateToEdit(id: string) {
    router.push(ROUTES.staffEdit(id));
  }

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    RolesService.list({ limit: 100 })
      .then((res) => setRoles(res.items.filter((r) => r.is_active)))
      .catch(() => {});
  }, []);

  return {
    staffList,
    pagination,
    filters,
    setFilters,
    isLoading,
    removeStaff,
    offboardStaff,
    reonboardStaff,
    resetStaffPassword,
    issuedCredentials,
    clearIssuedCredentials: () => setIssuedCredentials([]),
    updateFilters,
    refetch: fetchStaff,
    navigateToNew,
    navigateToView,
    navigateToEdit,
    isAdmin,
    roles,
  };
}
