'use client';

import { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useSchools } from '@/hooks/useSchools';
import {
  SUBSCRIPTIONS_PAGE, SUBSCRIPTION_STATUS_BADGE, PLAN_TYPE_OPTIONS,
  BILLING_MODEL_OPTIONS, RESTRICTION_MODE_OPTIONS, PAYMENT_METHOD_OPTIONS,
} from '@/constants';
import { PERMISSIONS, RESOURCE_LABELS } from '@/constants/permissions.registry';
import {
  Div, P, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  FormField, Input, CheckboxLabel,
  Badge, Spinner,
  PageHeader, PageCol,
  ResponsiveSelect, ResponsiveModalContainer,
} from '@/components/ui';

const RESTRICTABLE_RESOURCES = Object.keys(PERMISSIONS);

export default function SubscriptionsPage() {
  const {
    subscriptions, pagination, isLoading, plans,
    showModal, openModal, closeModal, form, handleSubmit, isSubmitting, toggleArrayValue,
    cancelSubscription,
  } = useSubscriptions();
  const { schools } = useSchools();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const planId = form.watch('plan_id');
  const billingModel = form.watch('billing_model');
  const restrictionMode = form.watch('restriction_mode');
  const restrictedResources = form.watch('restricted_resources') ?? [];
  const paymentMethods = form.watch('payment_methods_allowed') ?? [];
  const autoRenew = form.watch('auto_renew');

  function handleCancelConfirm(id: string) {
    cancelSubscription(id, cancelReason.trim() || undefined);
    setCancellingId(null);
    setCancelReason('');
  }

  return (
    <PageCol>
      <PageHeader
        title={SUBSCRIPTIONS_PAGE.title}
        subtitle={SUBSCRIPTIONS_PAGE.description}
        illustration="/illustrations/sparkles.svg"
        actions={<Button onClick={openModal}>{SUBSCRIPTIONS_PAGE.addButton}</Button>}
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.school}</TableHeaderCell>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.plan}</TableHeaderCell>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.type}</TableHeaderCell>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.amount}</TableHeaderCell>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.startDate}</TableHeaderCell>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.endDate}</TableHeaderCell>
            <TableHeaderCell>{SUBSCRIPTIONS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={8}><Spinner /></TableEmptyRow>
          ) : subscriptions.length === 0 ? (
            <TableEmptyRow colSpan={8}>{SUBSCRIPTIONS_PAGE.empty}</TableEmptyRow>
          ) : (
            subscriptions.map((sub) => {
              const school = schools.find((s) => s.id === sub.school_id);
              return (
                <TableRow key={sub.id}>
                  <TableCell primary>{school?.name ?? sub.school_id.slice(0, 8)}</TableCell>
                  <TableCell>{sub.plan_name}</TableCell>
                  <TableCell>{sub.plan_type}</TableCell>
                  <TableCell primary>
                    {sub.billing_model === 'PER_STUDENT'
                      ? `₹${sub.price_per_student ?? '—'}/student`
                      : `₹${sub.amount ?? '—'}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={SUBSCRIPTION_STATUS_BADGE[sub.status]}>{sub.status}</Badge>
                    {sub.auto_renew && sub.status === 'ACTIVE' && (
                      <Badge variant="default" className="ml-1">↻</Badge>
                    )}
                  </TableCell>
                  <TableCell>{sub.start_date ? new Date(sub.start_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    {sub.status !== 'ACTIVE' ? '—' : cancellingId === sub.id ? (
                      <Div type="col" gap="xs">
                        <Input
                          width="sm"
                          placeholder={SUBSCRIPTIONS_PAGE.cancelPrompt}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <Div type="row" gap="xs">
                          <Button size="sm" variant="ghost" onClick={() => handleCancelConfirm(sub.id)}>
                            {SUBSCRIPTIONS_PAGE.cancelSubmit}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setCancellingId(null); setCancelReason(''); }}>
                            {SUBSCRIPTIONS_PAGE.cancelDismiss}
                          </Button>
                        </Div>
                      </Div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setCancellingId(sub.id)}>
                        {SUBSCRIPTIONS_PAGE.cancelAction}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination total={pagination.total} page={pagination.page} totalPages={pagination.totalPages} />
      )}

      <ResponsiveModalContainer isOpen={showModal} onClose={closeModal} title={SUBSCRIPTIONS_PAGE.form.title}>
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-4">
            <Div type="col" gap="lg">
              <FormField label={SUBSCRIPTIONS_PAGE.form.school} error={form.formState.errors.school_id?.message}>
                <ResponsiveSelect
                  {...form.register('school_id')}
                  customPlaceholder={SUBSCRIPTIONS_PAGE.placeholders.selectSchool}
                  options={schools.map((s) => ({ value: s.id, label: s.name }))}
                />
              </FormField>

              <Div type="col" gap="md">
                <P color="muted">{SUBSCRIPTIONS_PAGE.form.sections.plan}</P>
                <FormField label={SUBSCRIPTIONS_PAGE.form.existingPlan}>
                  <ResponsiveSelect
                    {...form.register('plan_id')}
                    customPlaceholder={SUBSCRIPTIONS_PAGE.placeholders.selectPlan}
                    options={plans.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </FormField>

                {!planId && (
                  <>
                    <P color="muted" className="text-xs">{SUBSCRIPTIONS_PAGE.form.customPlanHint}</P>
                    <Div type="grid" cols={2} gap="md">
                      <FormField label={SUBSCRIPTIONS_PAGE.form.planName} error={form.formState.errors.plan_name?.message}>
                        <Input placeholder={SUBSCRIPTIONS_PAGE.placeholders.planName} {...form.register('plan_name')} />
                      </FormField>
                      <FormField label={SUBSCRIPTIONS_PAGE.form.planType} error={form.formState.errors.plan_type?.message}>
                        <ResponsiveSelect
                          {...form.register('plan_type')}
                          options={PLAN_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                        />
                      </FormField>
                    </Div>
                    <FormField label={SUBSCRIPTIONS_PAGE.form.billingModel} error={form.formState.errors.billing_model?.message}>
                      <ResponsiveSelect
                        {...form.register('billing_model')}
                        options={BILLING_MODEL_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                      />
                    </FormField>
                    {billingModel === 'PER_STUDENT' ? (
                      <FormField label={SUBSCRIPTIONS_PAGE.form.pricePerStudent} error={form.formState.errors.price_per_student?.message}>
                        <Input type="number" placeholder={SUBSCRIPTIONS_PAGE.placeholders.pricePerStudent} {...form.register('price_per_student')} />
                      </FormField>
                    ) : (
                      <FormField label={SUBSCRIPTIONS_PAGE.form.amount} error={form.formState.errors.amount?.message}>
                        <Input type="number" placeholder={SUBSCRIPTIONS_PAGE.placeholders.amount} {...form.register('amount')} />
                      </FormField>
                    )}
                  </>
                )}

                <FormField label={SUBSCRIPTIONS_PAGE.form.maxStudents} error={form.formState.errors.max_students?.message}>
                  <Input type="number" placeholder={SUBSCRIPTIONS_PAGE.placeholders.maxStudents} {...form.register('max_students')} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={SUBSCRIPTIONS_PAGE.form.startDate} error={form.formState.errors.start_date?.message}>
                    <Input type="date" {...form.register('start_date')} />
                  </FormField>
                  <FormField label={SUBSCRIPTIONS_PAGE.form.endDate} error={form.formState.errors.end_date?.message}>
                    <Input type="date" {...form.register('end_date')} />
                  </FormField>
                </Div>
                <Div type="row" align="center" gap="xs">
                  <input
                    type="checkbox"
                    id="auto-renew"
                    checked={!!autoRenew}
                    onChange={(e) => form.setValue('auto_renew', e.target.checked, { shouldDirty: true })}
                  />
                  <CheckboxLabel htmlFor="auto-renew">{SUBSCRIPTIONS_PAGE.form.autoRenew}</CheckboxLabel>
                </Div>
                {autoRenew && (
                  <P color="muted" className="text-xs">{SUBSCRIPTIONS_PAGE.form.autoRenewHint}</P>
                )}
              </Div>

              <Div type="col" gap="md">
                <P color="muted">{SUBSCRIPTIONS_PAGE.form.sections.policy}</P>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={SUBSCRIPTIONS_PAGE.form.gracePeriod}>
                    <Input type="number" placeholder={SUBSCRIPTIONS_PAGE.placeholders.gracePeriod} {...form.register('grace_period_days')} />
                  </FormField>
                  <FormField label={SUBSCRIPTIONS_PAGE.form.restrictionMode}>
                    <ResponsiveSelect
                      {...form.register('restriction_mode')}
                      options={RESTRICTION_MODE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                    />
                  </FormField>
                </Div>

                {restrictionMode === 'SOFT' && (
                  <FormField label={SUBSCRIPTIONS_PAGE.form.restrictedResources}>
                    <Div type="grid" cols={2} gap="xs">
                      {RESTRICTABLE_RESOURCES.map((resource) => (
                        <Div key={resource} type="row" align="center" gap="xs">
                          <input
                            type="checkbox"
                            id={`restricted-${resource}`}
                            checked={restrictedResources.includes(resource)}
                            onChange={() => toggleArrayValue('restricted_resources', resource)}
                          />
                          <CheckboxLabel htmlFor={`restricted-${resource}`}>
                            {RESOURCE_LABELS[resource] ?? resource}
                          </CheckboxLabel>
                        </Div>
                      ))}
                    </Div>
                  </FormField>
                )}

                <FormField label={SUBSCRIPTIONS_PAGE.form.paymentMethods}>
                  <Div type="grid" cols={2} gap="xs">
                    {PAYMENT_METHOD_OPTIONS.map((method) => (
                      <Div key={method.value} type="row" align="center" gap="xs">
                        <input
                          type="checkbox"
                          id={`payment-${method.value}`}
                          checked={paymentMethods.includes(method.value)}
                          onChange={() => toggleArrayValue('payment_methods_allowed', method.value)}
                        />
                        <CheckboxLabel htmlFor={`payment-${method.value}`}>{method.label}</CheckboxLabel>
                      </Div>
                    ))}
                  </Div>
                </FormField>
              </Div>
            </Div>
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button type="button" variant="outline" onClick={closeModal}>{SUBSCRIPTIONS_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{SUBSCRIPTIONS_PAGE.form.submit}</Button>
          </div>
        </form>
      </ResponsiveModalContainer>
    </PageCol>
  );
}
