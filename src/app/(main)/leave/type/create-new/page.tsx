'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLeaveTypeDetail } from '@/hooks/leave/useLeaveTypes';
import {
  Div,
  H1,
  H2,
  Button,
  Input,
  FormField,
  Spinner,
  ResponsiveSelect,
} from '@/components/ui';
import {
  LEAVE_TYPE_PAGE,
  LEAVE_VALIDITY_OPTIONS,
  LEAVE_PAY_TYPE_OPTIONS,
} from '@/constants/emp-leave.constants';
export default function LeaveTypeCreatePage() {
  const router = useRouter();

  const {
    form,
    handleSubmit,
    isSubmitting,
  } = useLeaveTypeDetail('create-new');

  const {
    register,
    formState: { errors },
  } = form;

  async function onFormSubmit() {
    await handleSubmit();
    router.push('/leave/type');
  }

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          {LEAVE_TYPE_PAGE.buttons.back}
        </Button>
        <H1>{LEAVE_TYPE_PAGE.buttons.addLeaveType}</H1>
      </Div>

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
                <ResponsiveSelect
                  {...register('leave_validity')}
                  options={LEAVE_VALIDITY_OPTIONS.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))}
                />
              </FormField>

              <FormField
                label={`${LEAVE_TYPE_PAGE.labels.leavePayType} *`}
                error={errors.leave_pay_type?.message}
              >
                <ResponsiveSelect
                  {...register('leave_pay_type')}
                  options={LEAVE_PAY_TYPE_OPTIONS.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))}
                />
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

          <Div type="row" justify="end" gap="sm">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              {LEAVE_TYPE_PAGE.buttons.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {LEAVE_TYPE_PAGE.buttons.createLeaveType}
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}