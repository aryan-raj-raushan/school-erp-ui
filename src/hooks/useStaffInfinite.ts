"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { StaffService, type StaffFilters } from "@/services/staff.service";
import { haptic } from "@/lib/haptics";
import type { Staff } from "@/types";
import type { IssuedCredential } from "@/components/shared/CredentialsDialog";

type ListFilters = Omit<StaffFilters, "page" | "limit">;

/**
 * Mobile staff list: infinite paging plus optimistic offboard / re-onboard,
 * delete and login password resets, so screens never touch the service directly.
 */
export function useStaffInfinite() {
  const list = useInfiniteList<Staff, ListFilters>({
    fetchPage: (params) => StaffService.list(params),
    initialFilters: {},
    errorMessage: "Failed to load staff",
  });

  const { patchItem, removeItem } = list;
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);

  async function setActive(staff: Staff, active: boolean) {
    patchItem(staff.id, { is_active: active });
    try {
      if (active) await StaffService.reonboard(staff.id);
      else await StaffService.offboard(staff.id);
      void haptic("success");
      toast.success(active ? "Staff member re-onboarded" : "Staff member offboarded");
    } catch (err: unknown) {
      patchItem(staff.id, { is_active: !active });
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function deleteStaff(staff: Staff) {
    try {
      await StaffService.remove(staff.id);
      removeItem(staff.id);
      void haptic("success");
      toast.success("Staff member deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function resetStaffPassword(staff: Staff) {
    try {
      const credentials = await StaffService.resetPassword(staff.id);
      void haptic("success");
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

  return {
    ...list,
    setActive,
    deleteStaff,
    resetStaffPassword,
    issuedCredentials,
    clearIssuedCredentials: () => setIssuedCredentials([]),
  };
}
