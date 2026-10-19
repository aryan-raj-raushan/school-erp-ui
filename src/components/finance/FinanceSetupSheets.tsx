"use client";

import {
  BottomSheet,
  Button,
  ChoiceChips,
  MobileSelectField,
  MobileTextField,
  ToggleRow,
} from "@/components/ui";

interface SheetFooterProps {
  cancelLabel?: string;
  submitLabel: string;
  isSubmitting: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

function Footer({ cancelLabel = "Cancel", submitLabel, isSubmitting, disabled, onCancel, onSubmit }: SheetFooterProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button
        type="button"
        size="lg"
        className="flex-[2]"
        loading={isSubmitting}
        disabled={disabled}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

// ─── Account ──────────────────────────────────────────────────────────────────

export interface AccountFormState {
  name: string;
  account_type: string;
  opening_balance?: number;
  account_start_date: string;
  is_enabled?: boolean;
}

export interface AccountSheetProps {
  isOpen: boolean;
  isEditing: boolean;
  form: AccountFormState;
  onChange: (patch: Partial<AccountFormState>) => void;
  accountTypes: ReadonlyArray<string>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function AccountSheet({
  isOpen,
  isEditing,
  form,
  onChange,
  accountTypes,
  isSubmitting,
  onSubmit,
  onClose,
}: AccountSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit finance account" : "Add finance account"}
      maxHeight="92dvh"
      footer={
        <Footer
          submitLabel={isEditing ? "Update" : "Create"}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <MobileTextField
          label="Account name"
          required
          placeholder="Enter name"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <MobileSelectField
          label="Account type"
          required
          value={form.account_type}
          onChange={(value) => onChange({ account_type: value })}
          options={accountTypes.map((t) => ({ value: t, label: t }))}
        />
        {!isEditing && (
          <>
            <MobileTextField
              label="Opening balance"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.opening_balance ?? 0}
              onChange={(e) => onChange({ opening_balance: parseFloat(e.target.value) || 0 })}
            />
            <p className="-mt-1 px-1 text-xs text-muted-foreground">Cannot be modified after creation</p>
            <MobileTextField
              label="Account start date"
              required
              type="date"
              value={form.account_start_date}
              onChange={(e) => onChange({ account_start_date: e.target.value })}
            />
          </>
        )}
        <ToggleRow
          label="Enabled"
          checked={form.is_enabled ?? true}
          onChange={(value) => onChange({ is_enabled: value })}
        />
      </div>
    </BottomSheet>
  );
}

// ─── Head ─────────────────────────────────────────────────────────────────────

export interface HeadFormState {
  name: string;
  head_type: string;
  is_enabled?: boolean;
}

export interface HeadSheetProps {
  isOpen: boolean;
  isEditing: boolean;
  form: HeadFormState;
  onChange: (patch: Partial<HeadFormState>) => void;
  headTypes: ReadonlyArray<string>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function HeadSheet({
  isOpen,
  isEditing,
  form,
  onChange,
  headTypes,
  isSubmitting,
  onSubmit,
  onClose,
}: HeadSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit finance head" : "Add income / expense head"}
      maxHeight="85dvh"
      footer={
        <Footer
          submitLabel={isEditing ? "Update" : "Create"}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <MobileTextField
          label="Head name"
          required
          placeholder="Enter name"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <ChoiceChips
          label="Head type"
          required
          value={form.head_type}
          onChange={(value) => onChange({ head_type: value })}
          options={headTypes.map((t) => ({ value: t, label: t }))}
        />
        <ToggleRow
          label="Enabled"
          checked={form.is_enabled ?? true}
          onChange={(value) => onChange({ is_enabled: value })}
        />
      </div>
    </BottomSheet>
  );
}
