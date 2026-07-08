'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStaffsPage } from '@/hooks/useStaffsPage';
import type { Staff } from '@/types';
import {
  Div,
  P,
  Button,
  Input,
  Select,
  DataTable,
  type ColumnDef,
  Modal,
  ModalBody,
  ModalFooter,
  FormField,
  Badge,
  Spinner,
  FileInput,
  PageCol,
  FilterBar,
  PageHeader,
  ResponsiveSelect,
  ResponsiveModalContainer,
} from '@/components/ui';
import { Pencil, Eye, UserX, UserCheck, Mail, Trash2, Plus } from 'lucide-react';
import { STAFF_STATUS_BADGE, STAFF_STATUS_OPTIONS } from '@/constants';
import { StaffDetail } from './staff-detail';

function StaffsPageContent() {
  const searchParams = useSearchParams();
  const detailId = searchParams.get('id');
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
    systemRoles,
  } = useStaffsPage();

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Name',
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
            {row.original.first_name} {row.original.last_name ?? ''}
          </Div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => row.original.role ?? '—',
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email ?? '—',
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone',
        cell: ({ row }) => row.original.phone_number ?? '—',
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.is_active ? 'success' : 'default'
            }
          >
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => navigateToView(row.original.id)}
              title="View"
            >
              <Eye size={14} />
            </Button>
            {isAdmin && (
              <>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => navigateToEdit(row.original.id)}
                  title="Edit"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => resendInvite(row.original.id)}
                  title="Resend Invite"
                >
                  <Mail size={14} />
                </Button>
                {row.original.is_active ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => offboardStaff(row.original.id)}
                    title="Offboard"
                  >
                    <UserX size={14} />
                  </Button>
                ) : (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => reonboardStaff(row.original.id)}
                    title="Re-onboard"
                  >
                    <UserCheck size={14} />
                  </Button>
                )}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => removeStaff(row.original.id)}
                  title="Delete"
                >
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </>
            )}
          </Div>
        ),
      },
    ],
    [isAdmin, navigateToView, navigateToEdit, resendInvite, offboardStaff, reonboardStaff, removeStaff],
  );

  if (detailId) {
    return <StaffDetail id={detailId} />;
  }

  return (
    <PageCol>
      <PageHeader
        title="Staff"
        subtitle={pagination ? `${pagination.total} staff members` : 'Loading...'}
        actions={
          <>
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
            <Button variant="outline" onClick={openBulkModal}>
              Bulk Import
            </Button>
            {isAdmin && (
              <Button onClick={navigateToNew}>
                <Plus size={16} />
                Add Staff
              </Button>
            )}
          </>
        }
      />

      <FilterBar>
        <Input
          width="md"
          placeholder="Search by name or phone"
          value={filters.search ?? ''}
          onChange={(e) =>
            updateFilters({ search: e.target.value || undefined })
          }
        />
        <ResponsiveSelect
          width="sm"
          options={STAFF_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          value={filters.status ?? ''}
          onChange={(e) =>
            updateFilters({
              status: (e.target.value as any) || undefined,
            })
          }
        />
        <ResponsiveSelect
          width="sm"
          customPlaceholder="All Roles"
          options={systemRoles.map((r) => ({ value: r.name.toUpperCase().replace(/ /g, '_'), label: r.name }))}
          value={filters.role ?? ''}
          onChange={(e) =>
            updateFilters({
              role: (e.target.value as any) || undefined,
            })
          }
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={staffList}
        isLoading={isLoading}
        emptyText="No staff members found."
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
            <FileInput
              ref={bulkFileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
            />
          </FormField>
          <P color="muted" size="xs">
            Download the template above to see the required format.
          </P>
        </Div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
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
        </div>
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
