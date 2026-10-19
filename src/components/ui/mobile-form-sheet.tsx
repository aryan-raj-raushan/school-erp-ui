"use client";

import * as React from "react";
import { Controller, get, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { BottomSheet } from "./action-sheet";
import { Button } from "./button";
import {
  ChoiceChips,
  FieldRow,
  MobileMultiSelectField,
  MobileSelectField,
  MobileTextArea,
  MobileTextField,
  ToggleRow,
  type SelectOption,
} from "./mobile-form";

type FieldBase<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  required?: boolean;
  /** Skip rendering this field (conditional fields). */
  hidden?: boolean;
};

export type SheetField<T extends FieldValues> =
  | (FieldBase<T> & {
      kind: "input";
      type?: "text" | "email" | "tel" | "number" | "date" | "time" | "password" | "url";
      placeholder?: string;
      valueAsNumber?: boolean;
      autoCapitalize?: "none" | "words" | "characters";
      prefix?: string;
    })
  | (FieldBase<T> & { kind: "textarea"; placeholder?: string })
  | (FieldBase<T> & {
      kind: "select";
      options: ReadonlyArray<SelectOption>;
      placeholder?: string;
      disabled?: boolean;
    })
  | (FieldBase<T> & {
      kind: "multiselect";
      options: ReadonlyArray<SelectOption>;
      placeholder?: string;
    })
  | (FieldBase<T> & { kind: "chips"; options: ReadonlyArray<SelectOption> })
  | (FieldBase<T> & { kind: "toggle"; description?: string })
  | { kind: "row"; fields: ReadonlyArray<SheetField<T>>; hidden?: boolean };

function renderField<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: SheetField<T>,
  key: string,
): React.ReactNode {
  if (field.hidden) return null;

  if (field.kind === "row") {
    return <FieldRow key={key}>{field.fields.map((f, i) => renderField(form, f, `${key}-${i}`))}</FieldRow>;
  }

  const error = get(form.formState.errors, field.name)?.message as string | undefined;

  switch (field.kind) {
    case "input":
      return (
        <MobileTextField
          key={key}
          label={field.label}
          required={field.required}
          type={field.type}
          prefix={field.prefix}
          placeholder={field.placeholder}
          autoCapitalize={field.autoCapitalize}
          inputMode={field.type === "number" ? "decimal" : field.type === "tel" ? "tel" : undefined}
          error={error}
          {...form.register(field.name, { valueAsNumber: field.valueAsNumber })}
        />
      );
    case "textarea":
      return (
        <MobileTextArea
          key={key}
          label={field.label}
          required={field.required}
          placeholder={field.placeholder}
          error={error}
          {...form.register(field.name)}
        />
      );
    case "select":
      return (
        <Controller
          key={key}
          control={form.control}
          name={field.name}
          render={({ field: f }) => (
            <MobileSelectField
              label={field.label}
              required={field.required}
              disabled={field.disabled}
              placeholder={field.placeholder}
              value={(f.value as string | undefined) ?? ""}
              onChange={f.onChange}
              options={field.options}
              error={error}
            />
          )}
        />
      );
    case "multiselect":
      return (
        <Controller
          key={key}
          control={form.control}
          name={field.name}
          render={({ field: f }) => (
            <MobileMultiSelectField
              label={field.label}
              required={field.required}
              placeholder={field.placeholder}
              value={(f.value as string[] | undefined) ?? []}
              onChange={f.onChange}
              options={field.options}
              error={error}
            />
          )}
        />
      );
    case "chips":
      return (
        <Controller
          key={key}
          control={form.control}
          name={field.name}
          render={({ field: f }) => (
            <ChoiceChips
              label={field.label}
              required={field.required}
              value={(f.value as string | undefined) ?? ""}
              onChange={f.onChange}
              options={field.options}
              error={error}
            />
          )}
        />
      );
    case "toggle":
      return (
        <Controller
          key={key}
          control={form.control}
          name={field.name}
          render={({ field: f }) => (
            <ToggleRow
              label={field.label}
              description={field.description}
              checked={Boolean(f.value)}
              onChange={f.onChange}
            />
          )}
        />
      );
  }
}

export interface MobileFormSheetProps<T extends FieldValues> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  form: UseFormReturn<T>;
  fields: ReadonlyArray<SheetField<T>>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown> | unknown;
  isSubmitting?: boolean;
  submitLabel: string;
  cancelLabel?: string;
  maxHeight?: string;
  /** Extra content under the fields (hints, summaries). */
  children?: React.ReactNode;
}

/**
 * Declarative phone form in a bottom sheet for react-hook-form forms: describe
 * the fields once and get native-style inputs, pickers and chips with a pinned
 * Cancel / Submit footer.
 */
export function MobileFormSheet<T extends FieldValues>({
  isOpen,
  onClose,
  title,
  form,
  fields,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelLabel = "Cancel",
  maxHeight = "92dvh",
  children,
}: MobileFormSheetProps<T>) {
  const formId = React.useId();

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxHeight={maxHeight}
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="submit" form={formId} size="lg" className="flex-[2]" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form id={formId} noValidate onSubmit={onSubmit} className="flex flex-col gap-3 pt-1">
        {fields.map((field, i) => renderField(form, field, String(i)))}
        {children}
      </form>
    </BottomSheet>
  );
}
