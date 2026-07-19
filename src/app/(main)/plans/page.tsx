'use client';

import { useMemo } from 'react';
import { PLANS_PAGE, CREATE_PLAN_FORM, PLAN_TYPE_OPTIONS, BILLING_MODEL_OPTIONS } from '@/constants';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import type { SubscriptionPlan } from '@/types';
import {
  Div, Button, Input,
  PageHeader, PageCol,
  DataTable,
  ResponsiveModalContainer, FormField,
  Badge,
  type ColumnDef,
  ResponsiveSelect,
} from '@/components/ui';

function cycleLabel(cycle: string): string {
  return PLAN_TYPE_OPTIONS.find((o) => o.value === cycle)?.label ?? cycle;
}

export default function PlansPage() {
  const {
    plans, pagination, isLoading,
    showCreateModal, openCreateModal, closeCreateModal, createForm, handleCreateSubmit, isCreating,
    toggleActive,
  } = useSubscriptionPlans();

  const billingModel = createForm.watch('billing_model');

  const columns = useMemo<ColumnDef<SubscriptionPlan>[]>(
    () => [
      {
        accessorKey: 'name',
        header: PLANS_PAGE.table.name,
        meta: { primary: true },
      },
      {
        accessorKey: 'billing_model',
        header: PLANS_PAGE.table.billingModel,
        cell: ({ row }) => (
          <Badge variant="default">
            {BILLING_MODEL_OPTIONS.find((o) => o.value === row.original.billing_model)?.label ?? row.original.billing_model}
          </Badge>
        ),
      },
      {
        id: 'price',
        header: PLANS_PAGE.table.price,
        cell: ({ row }) =>
          row.original.billing_model === 'FLAT'
            ? `₹${row.original.flat_amount ?? '—'}/mo`
            : `₹${row.original.price_per_student ?? '—'}/student/mo`,
      },
      {
        accessorKey: 'billing_cycle',
        header: PLANS_PAGE.table.cycle,
        cell: ({ row }) => cycleLabel(row.original.billing_cycle),
      },
      {
        accessorKey: 'is_active',
        header: PLANS_PAGE.table.status,
        cell: ({ row }) => (
          <Div type="row" gap="sm">
            <Badge variant={row.original.is_active ? 'success' : 'default'}>
              {row.original.is_active ? PLANS_PAGE.status.active : PLANS_PAGE.status.inactive}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => toggleActive(row.original)}>
              {row.original.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Div>
        ),
      },
    ],
    [toggleActive],
  );

  return (
    <PageCol>
      <PageHeader
        title={PLANS_PAGE.title}
        subtitle={pagination ? `${pagination.total} plans` : PLANS_PAGE.description}
        actions={<Button onClick={openCreateModal}>{PLANS_PAGE.addButton}</Button>}
      />

      <DataTable
        columns={columns}
        data={plans}
        isLoading={isLoading}
        emptyText={PLANS_PAGE.empty}
        pagination={pagination ?? undefined}
      />

      {showCreateModal && (
        <ResponsiveModalContainer isOpen={showCreateModal} onClose={closeCreateModal} title={CREATE_PLAN_FORM.title}>
          <form onSubmit={handleCreateSubmit}>
            <div className="px-4 py-4">
              <Div type="col" gap="md">
                <FormField label={CREATE_PLAN_FORM.labels.name} error={createForm.formState.errors.name?.message}>
                  <Input placeholder={CREATE_PLAN_FORM.placeholders.name} {...createForm.register('name')} />
                </FormField>
                <FormField label={CREATE_PLAN_FORM.labels.billing_model} error={createForm.formState.errors.billing_model?.message}>
                  <ResponsiveSelect
                    {...createForm.register('billing_model')}
                    options={BILLING_MODEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </FormField>
                {billingModel === 'PER_STUDENT' ? (
                  <FormField label={CREATE_PLAN_FORM.labels.price_per_student} error={createForm.formState.errors.price_per_student?.message}>
                    <Input type="number" placeholder={CREATE_PLAN_FORM.placeholders.price_per_student} {...createForm.register('price_per_student')} />
                  </FormField>
                ) : (
                  <FormField label={CREATE_PLAN_FORM.labels.flat_amount} error={createForm.formState.errors.flat_amount?.message}>
                    <Input type="number" placeholder={CREATE_PLAN_FORM.placeholders.flat_amount} {...createForm.register('flat_amount')} />
                  </FormField>
                )}
                <FormField label={CREATE_PLAN_FORM.labels.billing_cycle} error={createForm.formState.errors.billing_cycle?.message}>
                  <ResponsiveSelect
                    {...createForm.register('billing_cycle')}
                    options={PLAN_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </FormField>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeCreateModal}>{CREATE_PLAN_FORM.cancel}</Button>
              <Button type="submit" loading={isCreating}>{CREATE_PLAN_FORM.submit.idle}</Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
