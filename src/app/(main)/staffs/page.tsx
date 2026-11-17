"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStaffsPage } from "@/hooks/useStaffsPage";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import type { Staff } from "@/types";
import type { StaffFilters } from "@/services/staff.service";
import {
  Div,
  DataTable,
  type ColumnDef,
  Badge,
  Spinner,
  PageCol,
  PageHeader,
  type PageHeaderConfig,
  FilterToolbar,
  type FilterField,
  RowActions,
  BulkImportDialog,
} from "@/components/ui";
import {
  Pencil,
  UserX,
  UserCheck,
  KeyRound,
  Trash2,
  Plus,
  FileSpreadsheet,
} from "lucide-react";
import { STAFF_STATUS_OPTIONS, STAFF_PAGE, formatPersonName } from "@/constants";
import { StaffMobileList } from "@/components/staff/StaffMobileList";
import { useIsMobileReady } from "@/hooks/useIsMobileReady";
import { useBulkImport } from "@/hooks/useBulkImport";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.registry";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CredentialsDialog } from "@/components/shared/CredentialsDialog";

type PersistedStaffFilters = Pick<StaffFilters, "status" | "role">;

function StaffsDesktop() {
  const {
    staffList,
    pagination,
    filters,
    isLoading,
    removeStaff,
    offboardStaff,
    reonboardStaff,
    resetStaffPassword,
    issuedCredentials,
    clearIssuedCredentials,
    updateFilters,
    navigateToNew,
    navigateToView,
    navigateToEdit,
    isAdmin,
    roles,
    refetch,
  } = useStaffsPage();
  const { hasPermission } = usePermissions();
  const staffImport = useBulkImport("staff", { title: "Staff", onImported: () => refetch() });

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedStaffFilters>({
    key: STORAGE_FILTER_KEYS.STAFF,
    defaultValue: {},
  });

  function handleFilterChange(next: Partial<StaffFilters>) {
    updateFilters(next);

    const persisted: Partial<PersistedStaffFilters> = {};
    (["status", "role"] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    handleFilterChange({
      search: undefined,
      status: undefined,
      role: undefined,
    });
    clearStoredFilters();
  }

  // One-time: once storage has hydrated, apply any filters saved from a
  // previous visit.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) updateFilters(storedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: "Search by name or phone",
      },
      {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "All Status",
        options: STAFF_STATUS_OPTIONS.filter((o) => o.value).map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
      {
        type: "select",
        key: "role",
        label: "Role",
        placeholder: "All Roles",
        options: roles.map((r) => ({
          value: r.name.toUpperCase().replace(/ /g, "_"),
          label: r.name,
        })),
      },
    ],
    [roles],
  );

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    status: filters.status,
    role: filters.role,
  };

  const pageHeaderConfig: PageHeaderConfig = {
    title: STAFF_PAGE.title,
    subtitle: pagination ? `${pagination.total} staff members` : "Loading...",
    actions: [
      {
        label: STAFF_PAGE.importButton,
        icon: <FileSpreadsheet size={14} />,
        variant: "outline",
        onClick: staffImport.open,
        hidden: !hasPermission(PERMISSIONS.staff.create),
      },
      {
        label: STAFF_PAGE.addButton,
        icon: <Plus size={14} />,
        onClick: navigateToNew,
        hidden: !isAdmin,
      },
    ],
  };

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: "first_name",
        header: STAFF_PAGE.table.name,
        meta: { primary: true },
        cell: ({ row }) => (
          <Div type="row" align="center" gap="sm">
            {row.original.profile_image && (
              <img
                src={row.original.profile_image}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            {formatPersonName(row.original)}
          </Div>
        ),
      },
      {
        accessorKey: "role",
        header: STAFF_PAGE.table.role,
        cell: ({ row }) => row.original.role ?? "—",
      },
      {
        accessorKey: "email",
        header: STAFF_PAGE.table.email,
        cell: ({ row }) => row.original.email ?? "—",
      },
      {
        accessorKey: "phone_number",
        header: STAFF_PAGE.table.phone,
        cell: ({ row }) =>
          row.original.phone_number ? (
            <span className="inline-flex items-center gap-1">
              {row.original.phone_number}
              <WhatsAppButton phone={row.original.phone_number} dialCode={row.original.dial_code} />
            </span>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "is_active",
        header: STAFF_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "success" : "default"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: STAFF_PAGE.table.actions,
        cell: ({ row }) => {
          const name = `${row.original.first_name} ${
            row.original.last_name ?? ""
          }`.trim();
          return (
            <RowActions
              onView={() => navigateToView(row.original.id)}
              actions={[
                {
                  label: "Edit",
                  icon: <Pencil size={14} />,
                  onClick: () => navigateToEdit(row.original.id),
                  hidden: !isAdmin,
                },
                {
                  label: "Reset login password",
                  icon: <KeyRound size={14} />,
                  hidden: !isAdmin,
                  confirm: {
                    description: `Issue a new temporary password for ${name}? Their current password will stop working.`,
                  },
                  onClick: () => resetStaffPassword(row.original),
                },
                {
                  label: "Offboard",
                  icon: <UserX size={14} />,
                  hidden: !isAdmin || !row.original.is_active,
                  confirm: {
                    title: "Offboard Staff",
                    description: `Offboard ${name}? They will lose access to the system.`,
                    confirmLabel: "Offboard",
                  },
                  onClick: () => offboardStaff(row.original.id),
                },
                {
                  label: "Re-onboard",
                  icon: <UserCheck size={14} />,
                  hidden: !isAdmin || row.original.is_active,
                  onClick: () => reonboardStaff(row.original.id),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={14} />,
                  variant: "destructive",
                  hidden: !isAdmin,
                  confirm: {
                    description: `Are you sure you want to delete ${name}? This action cannot be undone.`,
                  },
                  onClick: () => removeStaff(row.original.id),
                },
              ]}
            />
          );
        },
      },
    ],
    [
      isAdmin,
      navigateToView,
      navigateToEdit,
      resetStaffPassword,
      offboardStaff,
      reonboardStaff,
      removeStaff,
    ],
  );

  return (
    <PageCol>
      <CredentialsDialog
        title="Staff login"
        credentials={issuedCredentials}
        onClose={clearIssuedCredentials}
      />
      <PageHeader sticky {...pageHeaderConfig} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={(next) => handleFilterChange(next as Partial<StaffFilters>)}
        onClear={handleClearFilters}
        sheetTitle="Filter Staff"
      />

      <DataTable
        columns={columns}
        data={staffList}
        isLoading={isLoading}
        emptyText={STAFF_PAGE.empty}
        pagination={pagination ?? undefined}
        fillViewport
      />

      <BulkImportDialog controller={staffImport} />
    </PageCol>
  );
}

function StaffsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacyId = searchParams.get("id");
  const isMobile = useIsMobileReady();

  // Old links used `/staffs?id=…` for the detail screen.
  useEffect(() => {
    if (!legacyId) return;
    const edit = searchParams.get("edit") === "true";
    router.replace(`/staffs/view?id=${legacyId}${edit ? "&edit=true" : ""}`);
  }, [legacyId, searchParams, router]);

  if (isMobile === undefined || legacyId) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  return isMobile ? <StaffMobileList /> : <StaffsDesktop />;
}

export default function StaffsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <StaffsPageContent />
    </Suspense>
  );
}
