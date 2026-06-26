'use client';

import { use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Pencil, X } from 'lucide-react';
import { useLeaveTypeDetail } from '@/hooks/leave/useLeaveTypes';
import {
  Div,
  H1,
  H2,
  P,
  Button,
  Input,
  Select,
  FormField,
  Badge,
  Spinner,
  InfoRow,
} from '@/components/ui';
import {
  LEAVE_TYPE_PAGE,
  LEAVE_VALIDITY_OPTIONS,
  LEAVE_PAY_TYPE_OPTIONS,
  LEAVE_VALIDITY_LABEL,
  LEAVE_PAY_TYPE_LABEL,
} from '@/constants/emp-leave.constants';

export default function LeaveTypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const startEditing = searchParams.get('edit') === 'true';

  const isNew = slug === 'create-new';
  const resolvedId = slug === 'view' ? (queryId ?? undefined) : isNew ? undefined : slug;

  const {
    leaveType,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    isNew: detailIsNew,
    handleSubmit,
    isSubmitting,
  } = useLeaveTypeDetail(isNew ? 'create-new' : resolvedId);

  const {
    register,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (startEditing && !isNew) setIsEditing(true);
  }, [startEditing, isNew, setIsEditing]);

  async function onFormSubmit() {
    await handleSubmit();
    if (isNew) router.push('/leave/type');
  }

  if (isLoading) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          {LEAVE_TYPE_PAGE.buttons.back}
        </Button>

        <Div type="col" gap="xs" className="flex-1">
          <Div type="row" align="center" gap="sm">
            <H1>
              {isNew
                ? LEAVE_TYPE_PAGE.buttons.addLeaveType
                : (leaveType?.leave_name ?? 'Leave Type Details')}
            </H1>
            {!isNew && leaveType && (
              <Badge variant={leaveType.is_enabled ? 'success' : 'secondary'}>
                {leaveType.is_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            )}
          </Div>
          {!isNew && leaveType && (
            <P color="muted">
              {LEAVE_PAY_TYPE_LABEL[leaveType.leave_pay_typ]} ·{' '}
              {LEAVE_VALIDITY_LABEL[leaveType.leave_validity]} ·{' '}
              {leaveType.leave_count_days} days
            </P>
          )}
        </Div>

        {!isNew && (
          <Div type="row" gap="sm">
            {isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                <X size={14} />
                {LEAVE_TYPE_PAGE.buttons.cancel}
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Pencil size={14} />
                {LEAVE_TYPE_PAGE.buttons.edit}
              </Button>
            )}
          </Div>
        )}
      </Div>

      {/* View Mode */}
      {!isEditing && !isNew && leaveType && (
        <Div
          type="col"
          gap="sm"
          className="rounded-xl border border-border bg-card p-5"
        >
          <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {LEAVE_TYPE_PAGE.sections.basicInfo}
          </H2>
          <InfoRow
            label={LEAVE_TYPE_PAGE.labels.leaveName}
            value={leaveType.leave_name}
          />
          <InfoRow
            label={LEAVE_TYPE_PAGE.labels.leaveValidity}
            value={LEAVE_VALIDITY_LABEL[leaveType.leave_validity]}
          />
          <InfoRow
            label={LEAVE_TYPE_PAGE.labels.leavePayType}
            value={LEAVE_PAY_TYPE_LABEL[leaveType.leave_pay_type]}
          />
          <InfoRow
            label={LEAVE_TYPE_PAGE.labels.leaveCountDays}
            value={`${leaveType.leave_count_days} days`}
          />
          <InfoRow
            label={LEAVE_TYPE_PAGE.labels.isEnabled}
            value={leaveType.is_enabled ? 'Yes' : 'No'}
          />
        </Div>
      )}

      {/* Create / Edit Form */}
      {(isEditing || isNew) && (
        <form onSubmit={form.handleSubmit(onFormSubmit as any)}>
          <Div type="col" gap="lg">
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {LEAVE_TYPE_PAGE.sections.basicInfo}
              </H2>

              <FormField
                label={`${LEAVE_TYPE_PAGE.labels.leaveName} *`}
                error={errors.leave_name?.message}
              >
                <Input
                  placeholder={LEAVE_TYPE_PAGE.placeholders.leaveName}
                  {...register('leave_name')}
                />
              </FormField>

              <Div type="grid" cols={2} gap="md">
                <FormField
                  label={`${LEAVE_TYPE_PAGE.labels.leaveValidity} *`}
                  error={errors.leave_validity?.message}
                >
                  <Select {...register('leave_validity')}>
                    {LEAVE_VALIDITY_OPTIONS.filter((o) => o.value !== '').map(
                      (o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ),
                    )}
                  </Select>
                </FormField>

                <FormField
                  label={`${LEAVE_TYPE_PAGE.labels.leavePayType} *`}
                  error={errors.leave_pay_type?.message}
                >
                  <Select {...register('leave_pay_type')}>
                    {LEAVE_PAY_TYPE_OPTIONS.filter((o) => o.value !== '').map(
                      (o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ),
                    )}
                  </Select>
                </FormField>
              </Div>

              <FormField
                label={`${LEAVE_TYPE_PAGE.labels.leaveCountDays} *`}
                error={errors.leave_count_days?.message}
              >
                <Input
                  type="number"
                  min={1}
                  placeholder={LEAVE_TYPE_PAGE.placeholders.leaveCountDays}
                  {...register('leave_count_days', { valueAsNumber: true })}
                />
              </FormField>

              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="is_enabled"
                  {...register('is_enabled')}
                />
                <label
                  htmlFor="is_enabled"
                  className="text-sm font-medium text-foreground/80 cursor-pointer"
                >
                  {LEAVE_TYPE_PAGE.labels.isEnabled}
                </label>
              </Div>
            </Div>

            {/* Actions */}
            <Div type="row" justify="end" gap="sm">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  if (isNew) {
                    router.back();
                  } else {
                    setIsEditing(false);
                    reset();
                  }
                }}
              >
                {LEAVE_TYPE_PAGE.buttons.cancel}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isNew
                  ? LEAVE_TYPE_PAGE.buttons.createLeaveType
                  : LEAVE_TYPE_PAGE.buttons.saveChanges}
              </Button>
            </Div>
          </Div>
        </form>
      )}
    </Div>
  );
}