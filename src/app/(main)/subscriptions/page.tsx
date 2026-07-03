'use client';

import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useSchools } from '@/hooks/useSchools';
import { SUBSCRIPTIONS_PAGE, SUBSCRIPTION_STATUS_BADGE, PLAN_TYPE_OPTIONS } from '@/constants';
import {
  Div, P, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  FormField, Input,
  Badge, Spinner,
  PageHeader, PageCol,
  ResponsiveSelect, ResponsiveModalContainer,
} from '@/components/ui';

export default function SubscriptionsPage() {
  const { subscriptions, pagination, isLoading, showModal, openModal, closeModal, form, handleSubmit, isSubmitting } = useSubscriptions();
  const { schools } = useSchools();

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
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
          ) : subscriptions.length === 0 ? (
            <TableEmptyRow colSpan={7}>{SUBSCRIPTIONS_PAGE.empty}</TableEmptyRow>
          ) : (
            subscriptions.map((sub) => {
              const school = schools.find((s) => s.id === sub.school_id);
              return (
                <TableRow key={sub.id}>
                  <TableCell primary>{school?.name ?? sub.school_id.slice(0, 8)}</TableCell>
                  <TableCell>{sub.plan_name}</TableCell>
                  <TableCell>{sub.plan_type}</TableCell>
                  <TableCell primary>₹{sub.amount}</TableCell>
                  <TableCell>
                    <Badge variant={SUBSCRIPTION_STATUS_BADGE[sub.status]}>{sub.status}</Badge>
                  </TableCell>
                  <TableCell>{sub.start_date ? new Date(sub.start_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : '—'}</TableCell>
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
            <Div type="col" gap="md">
              <FormField label={SUBSCRIPTIONS_PAGE.form.school} error={form.formState.errors.school_id?.message}>
                <ResponsiveSelect
                  {...form.register('school_id')}
                  customPlaceholder={SUBSCRIPTIONS_PAGE.placeholders.selectSchool}
                  options={schools.map((s) => ({ value: s.id, label: s.name }))}
                />
              </FormField>
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
              <Div type="grid" cols={2} gap="md">
                <FormField label={SUBSCRIPTIONS_PAGE.form.amount} error={form.formState.errors.amount?.message}>
                  <Input type="number" placeholder={SUBSCRIPTIONS_PAGE.placeholders.amount} {...form.register('amount')} />
                </FormField>
                <FormField label={SUBSCRIPTIONS_PAGE.form.maxStudents} error={form.formState.errors.max_students?.message}>
                  <Input type="number" placeholder={SUBSCRIPTIONS_PAGE.placeholders.maxStudents} {...form.register('max_students')} />
                </FormField>
              </Div>
              <Div type="grid" cols={2} gap="md">
                <FormField label={SUBSCRIPTIONS_PAGE.form.startDate} error={form.formState.errors.start_date?.message}>
                  <Input type="date" {...form.register('start_date')} />
                </FormField>
                <FormField label={SUBSCRIPTIONS_PAGE.form.endDate} error={form.formState.errors.end_date?.message}>
                  <Input type="date" {...form.register('end_date')} />
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
