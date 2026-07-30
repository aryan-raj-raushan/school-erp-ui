"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useStaffsPage } from "@/hooks/useStaffsPage";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import type { Staff } from "@/types";
import type { StaffFilters } from "@/services/staff.service";
import {
  Div,
  P,
  Button,
  DataTable,
  type ColumnDef,
  FormField,
  Badge,
  Spinner,
  FileInput,
  PageCol,
  PageHeader,
  type PageHeaderConfig,
  FilterToolbar,
  type FilterField,
  RowActions,
  ResponsiveModalContainer,
} from "@/components/ui";
import {
  Pencil,
  UserX,
  UserCheck,
  Mail,
  Trash2,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import { STAFF_STATUS_OPTIONS, STAFF_PAGE } from "@/constants";
import { StaffDetail } from "./staff-detail";

type PersistedStaffFilters = Pick<StaffFilters, "status" | "role">;

function StaffsPageContent() {
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");
  const {
    staffList,
    pagination,
    filters,
    isLoading,
    removeStaff,
    offboardStaff,
    reonboardStaff,
    resendInvite,
    updateFilters,
    navigateToNew,
    navigateToView,
    navigateToEdit,
    showBulkModal,
    openBulkModal,
    closeBulkModal,
    bulkFileRef,
    isImporting,
    bulkImport,
    downloadTemplate,
    isAdmin,
    roles,
  } = useStaffsPage();

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
      // {
      //   label: STAFF_PAGE.downloadTemplate,
      //   icon: <Download size={14} />,
      //   variant: 'outline',
      //   onClick: downloadTemplate,
      // },
      // {
      //   label: STAFF_PAGE.bulkImport,
      //   icon: <Upload size={14} />,
      //   variant: 'outline',
      //   onClick: openBulkModal,
      // },
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
            {row.original.first_name} {row.original.last_name ?? ""}
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
        cell: ({ row }) => row.original.phone_number ?? "—",
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
                  label: "Resend Invite",
                  icon: <Mail size={14} />,
                  onClick: () => resendInvite(row.original.id),
                  hidden: !isAdmin,
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
      resendInvite,
      offboardStaff,
      reonboardStaff,
      removeStaff,
    ],
  );

  if (detailId) {
    return <StaffDetail id={detailId} />;
  }

  return (
    <PageCol>
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

      <ResponsiveModalContainer
        isOpen={showBulkModal}
        onClose={closeBulkModal}
        title="Bulk Import Staff"
      >
        <Div type="col" gap="md" className="px-4 py-4">
          <FormField label="Excel File *">
            <FileInput ref={bulkFileRef} type="file" accept=".xlsx,.xls,.csv" />
          </FormField>
          <P color="muted" size="xs">
            Download the template above to see the required format.
          </P>
        </Div>

        <Div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="secondary" onClick={closeBulkModal}>
            Cancel
          </Button>
          <Button
            onClick={() => bulkImport()}
            loading={isImporting}
            disabled={!bulkFileRef.current?.files?.length}
          >
            Import
          </Button>
        </Div>
      </ResponsiveModalContainer>
    </PageCol>
  );
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
