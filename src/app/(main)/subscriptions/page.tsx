'use client';

import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useSchools } from '@/hooks/useSchools';
import { SUBSCRIPTIONS_PAGE, SUBSCRIPTION_STATUS_BADGE, PLAN_TYPE_OPTIONS } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, P, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  Modal, ModalBody, ModalFooter, FormField, Input, Select,
  Badge, Spinner,
} from '@/components/ui';

export default function SubscriptionsPage() {
  const { subscriptions, pagination, isLoading, showModal, openModal, closeModal, form, handleSubmit, isSubmitting } = useSubscriptions();
  const { schools } = useSchools();

  return (
    <Div type="col" gap="lg">
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

      {showModal && (
        <Modal onClose={closeModal} title={SUBSCRIPTIONS_PAGE.form.title}>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label={SUBSCRIPTIONS_PAGE.form.school} error={form.formState.errors.school_id?.message}>
                  <Select {...form.register('school_id')}>
                    <option value="">{SUBSCRIPTIONS_PAGE.placeholders.selectSchool}</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={SUBSCRIPTIONS_PAGE.form.planName} error={form.formState.errors.plan_name?.message}>
                    <Input placeholder={SUBSCRIPTIONS_PAGE.placeholders.planName} {...form.register('plan_name')} />
                  </FormField>
                  <FormField label={SUBSCRIPTIONS_PAGE.form.planType} error={form.formState.errors.plan_type?.message}>
                    <Select {...form.register('plan_type')}>
                      {PLAN_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
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
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>{SUBSCRIPTIONS_PAGE.form.cancel}</Button>
              <Button type="submit" loading={isSubmitting}>{SUBSCRIPTIONS_PAGE.form.submit}</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
