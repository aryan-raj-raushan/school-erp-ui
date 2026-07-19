'use client';

import { useMemo } from 'react';
import {
  RFID_INVENTORY_PAGE, CREATE_DEVICE_FORM, ASSIGN_DEVICE_FORM,
  RFID_DEVICE_STATUS_BADGE, RFID_DEVICE_STATUS_OPTIONS, ONE_TIME_CHARGE_TYPE_OPTIONS,
} from '@/constants';
import { useRfidInventory } from '@/hooks/useRfidInventory';
import { useSchools } from '@/hooks/useSchools';
import type { RfidDevice } from '@/types';
import {
  Div, Button, Input, CheckboxLabel,
  PageHeader, PageCol, FilterBar,
  DataTable,
  ResponsiveModalContainer, FormField,
  Badge,
  type ColumnDef,
  ResponsiveSelect,
} from '@/components/ui';

function fmtDate(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString() : '—';
}

export default function RfidInventoryPage() {
  const {
    devices, pagination, filters, isLoading, updateFilters,
    showCreateModal, openCreateModal, closeCreateModal, createForm, handleCreateSubmit, isCreating,
    assigningDevice, openAssignModal, closeAssignModal, assignForm, handleAssignSubmit, isAssigning,
    installDevice, returnDevice,
  } = useRfidInventory();
  const { schools } = useSchools();

  const schoolNameById = useMemo(() => new Map(schools.map((s) => [s.id, s.name])), [schools]);
  const billable = assignForm.watch('billable');

  const columns = useMemo<ColumnDef<RfidDevice>[]>(
    () => [
      {
        accessorKey: 'device_identifier',
        header: RFID_INVENTORY_PAGE.table.identifier,
        meta: { primary: true },
      },
      {
        accessorKey: 'device_model',
        header: RFID_INVENTORY_PAGE.table.model,
        cell: ({ row }) => row.original.device_model ?? '—',
      },
      {
        accessorKey: 'status',
        header: RFID_INVENTORY_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={RFID_DEVICE_STATUS_BADGE[row.original.status]}>{row.original.status}</Badge>
        ),
      },
      {
        id: 'school',
        header: RFID_INVENTORY_PAGE.table.school,
        cell: ({ row }) =>
          row.original.assigned_school_id
            ? (schoolNameById.get(row.original.assigned_school_id) ?? row.original.assigned_school_id.slice(0, 8))
            : '—',
      },
      {
        accessorKey: 'installation_date',
        header: RFID_INVENTORY_PAGE.table.installDate,
        cell: ({ row }) => fmtDate(row.original.installation_date),
      },
      {
        accessorKey: 'warranty_expiry',
        header: RFID_INVENTORY_PAGE.table.warranty,
        cell: ({ row }) => fmtDate(row.original.warranty_expiry),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Div type="row" gap="sm">
            {(row.original.status === 'IN_STOCK' || row.original.status === 'RETURNED') && (
              <Button size="sm" onClick={() => openAssignModal(row.original)}>
                {RFID_INVENTORY_PAGE.actions.assign}
              </Button>
            )}
            {row.original.status === 'ASSIGNED' && (
              <Button size="sm" variant="outline" onClick={() => installDevice(row.original)}>
                {RFID_INVENTORY_PAGE.actions.install}
              </Button>
            )}
            {(row.original.status === 'ASSIGNED' || row.original.status === 'INSTALLED') && (
              <Button size="sm" variant="ghost" onClick={() => returnDevice(row.original)}>
                {RFID_INVENTORY_PAGE.actions.return}
              </Button>
            )}
          </Div>
        ),
      },
    ],
    [schoolNameById, openAssignModal, installDevice, returnDevice],
  );

  return (
    <PageCol>
      <PageHeader
        title={RFID_INVENTORY_PAGE.title}
        subtitle={pagination ? `${pagination.total} devices` : RFID_INVENTORY_PAGE.description}
        actions={<Button onClick={openCreateModal}>{RFID_INVENTORY_PAGE.addButton}</Button>}
      />

      <FilterBar>
        <ResponsiveSelect
          width="sm"
          value={filters.status ?? ''}
          onChange={(e) => updateFilters({ status: (e.target.value || undefined) as RfidDevice['status'] | undefined })}
          customPlaceholder="All statuses"
          options={RFID_DEVICE_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={devices}
        isLoading={isLoading}
        emptyText={RFID_INVENTORY_PAGE.empty}
        pagination={pagination ?? undefined}
      />

      {showCreateModal && (
        <ResponsiveModalContainer isOpen={showCreateModal} onClose={closeCreateModal} title={CREATE_DEVICE_FORM.title}>
          <form onSubmit={handleCreateSubmit}>
            <div className="px-4 py-4">
              <Div type="col" gap="md">
                <FormField label={CREATE_DEVICE_FORM.labels.device_identifier} error={createForm.formState.errors.device_identifier?.message}>
                  <Input placeholder={CREATE_DEVICE_FORM.placeholders.device_identifier} {...createForm.register('device_identifier', { required: true })} />
                </FormField>
                <FormField label={CREATE_DEVICE_FORM.labels.device_model}>
                  <Input placeholder={CREATE_DEVICE_FORM.placeholders.device_model} {...createForm.register('device_model')} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={CREATE_DEVICE_FORM.labels.purchase_date}>
                    <Input type="date" {...createForm.register('purchase_date')} />
                  </FormField>
                  <FormField label={CREATE_DEVICE_FORM.labels.warranty_expiry}>
                    <Input type="date" {...createForm.register('warranty_expiry')} />
                  </FormField>
                </Div>
                <FormField label={CREATE_DEVICE_FORM.labels.notes}>
                  <Input {...createForm.register('notes')} />
                </FormField>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeCreateModal}>{CREATE_DEVICE_FORM.cancel}</Button>
              <Button type="submit" loading={isCreating}>{CREATE_DEVICE_FORM.submit.idle}</Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}

      {assigningDevice && (
        <ResponsiveModalContainer
          isOpen={!!assigningDevice}
          onClose={closeAssignModal}
          title={`${ASSIGN_DEVICE_FORM.title} — ${assigningDevice.device_identifier}`}
        >
          <form onSubmit={handleAssignSubmit}>
            <div className="px-4 py-4">
              <Div type="col" gap="md">
                <FormField label={ASSIGN_DEVICE_FORM.labels.school} error={assignForm.formState.errors.school_id?.message}>
                  <ResponsiveSelect
                    {...assignForm.register('school_id', { required: true })}
                    customPlaceholder="Select school"
                    options={schools.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </FormField>
                <Div type="row" align="center" gap="xs">
                  <input type="checkbox" id="billable" {...assignForm.register('billable')} />
                  <CheckboxLabel htmlFor="billable">{ASSIGN_DEVICE_FORM.labels.billable}</CheckboxLabel>
                </Div>
                {billable && (
                  <>
                    <FormField label={ASSIGN_DEVICE_FORM.labels.charge_type}>
                      <ResponsiveSelect
                        {...assignForm.register('charge_type')}
                        options={ONE_TIME_CHARGE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      />
                    </FormField>
                    <FormField label={ASSIGN_DEVICE_FORM.labels.charge_amount}>
                      <Input type="number" {...assignForm.register('charge_amount', { valueAsNumber: true })} />
                    </FormField>
                  </>
                )}
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeAssignModal}>{ASSIGN_DEVICE_FORM.cancel}</Button>
              <Button type="submit" loading={isAssigning}>{ASSIGN_DEVICE_FORM.submit}</Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
