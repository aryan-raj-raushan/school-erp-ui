'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { CREATE_SCHOOL_FORM, BOARD_TYPES } from '@/constants';
import { createSchoolSchema, type CreateSchoolFormValues } from '@/lib/validations/schools.validation';
import type { CreateSchoolPayload } from '@/services/schools.service';

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSchoolPayload) => Promise<void>;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50';

export function CreateSchoolModal({ isOpen, isSubmitting, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { dial_code: '+91' },
  });

  if (!isOpen) return null;

  async function onValid(values: CreateSchoolFormValues) {
    const payload: CreateSchoolPayload = {
      name: values.name,
      ...(values.code && { code: values.code }),
      ...(values.email && { email: values.email }),
      ...(values.contact_number && { contact_number: values.contact_number, dial_code: values.dial_code }),
      ...(values.website && { website: values.website }),
      ...(values.address && { address: values.address }),
      ...(values.city && { city: values.city }),
      ...(values.state && { state: values.state }),
      ...(values.pincode && { pincode: values.pincode }),
      ...(values.board_type && { board_type: values.board_type }),
    };

    await onSubmit(payload);
    reset();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {CREATE_SCHOOL_FORM.title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="px-6 py-5 space-y-5">
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {CREATE_SCHOOL_FORM.sections.basic}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label={`${CREATE_SCHOOL_FORM.labels.name} *`} error={errors.name?.message}>
                <input
                  {...register('name')}
                  placeholder={CREATE_SCHOOL_FORM.placeholders.name}
                  className={inputCls}
                />
              </Field>
              <Field label={CREATE_SCHOOL_FORM.labels.code} error={errors.code?.message}>
                <input
                  {...register('code')}
                  placeholder={CREATE_SCHOOL_FORM.placeholders.code}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label={CREATE_SCHOOL_FORM.labels.board_type} error={errors.board_type?.message}>
              <select {...register('board_type')} className={inputCls}>
                <option value="">{CREATE_SCHOOL_FORM.placeholders.board_type}</option>
                {BOARD_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {CREATE_SCHOOL_FORM.sections.contact}
            </p>
            <Field label={CREATE_SCHOOL_FORM.labels.email} error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                placeholder={CREATE_SCHOOL_FORM.placeholders.email}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <Field label={CREATE_SCHOOL_FORM.labels.dial_code} error={errors.dial_code?.message}>
                <input
                  {...register('dial_code')}
                  placeholder={CREATE_SCHOOL_FORM.placeholders.dial_code}
                  className={inputCls}
                />
              </Field>
              <Field label={CREATE_SCHOOL_FORM.labels.contact_number} error={errors.contact_number?.message}>
                <input
                  {...register('contact_number')}
                  type="tel"
                  placeholder={CREATE_SCHOOL_FORM.placeholders.contact_number}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label={CREATE_SCHOOL_FORM.labels.website} error={errors.website?.message}>
              <input
                {...register('website')}
                type="url"
                placeholder={CREATE_SCHOOL_FORM.placeholders.website}
                className={inputCls}
              />
            </Field>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {CREATE_SCHOOL_FORM.sections.location}
            </p>
            <Field label={CREATE_SCHOOL_FORM.labels.address} error={errors.address?.message}>
              <input
                {...register('address')}
                placeholder={CREATE_SCHOOL_FORM.placeholders.address}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label={CREATE_SCHOOL_FORM.labels.city} error={errors.city?.message}>
                <input
                  {...register('city')}
                  placeholder={CREATE_SCHOOL_FORM.placeholders.city}
                  className={inputCls}
                />
              </Field>
              <Field label={CREATE_SCHOOL_FORM.labels.state} error={errors.state?.message}>
                <input
                  {...register('state')}
                  placeholder={CREATE_SCHOOL_FORM.placeholders.state}
                  className={inputCls}
                />
              </Field>
              <Field label={CREATE_SCHOOL_FORM.labels.pincode} error={errors.pincode?.message}>
                <input
                  {...register('pincode')}
                  placeholder={CREATE_SCHOOL_FORM.placeholders.pincode}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {CREATE_SCHOOL_FORM.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? CREATE_SCHOOL_FORM.submit.loading : CREATE_SCHOOL_FORM.submit.idle}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
