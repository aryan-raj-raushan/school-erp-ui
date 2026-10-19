"use client";

import type { UseFormReturn } from "react-hook-form";
import { Lock, Pencil, ShieldCheck } from "lucide-react";
import {
  Badge,
  Button,
  ControlledToggleRow,
  DetailHero,
  DetailSection,
  FormGroup,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
  StickyActionBar,
} from "@/components/ui";
import { PermissionMatrix } from "@/components/ui/permission-matrix";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { RoleFormValues } from "@/hooks/useRoleDetail";
import type { GroupedPermissions } from "@/services/permissions.service";

const STEPS: ReadonlyArray<FormStep<RoleFormValues>> = [
  { id: "general", label: "General", fields: ["name", "description", "is_active"] },
  { id: "permissions", label: "Permissions", fields: [] },
];

interface PermissionProps {
  groupedPermissions: GroupedPermissions;
  selectedPermissionIds: Set<string>;
  onTogglePermission: (id: string) => void;
  onToggleResourceAll: (resource: string) => void;
  onToggleSelectAll: () => void;
}

export interface RoleMobileFormProps extends PermissionProps {
  form: UseFormReturn<RoleFormValues>;
  isNew: boolean;
  isSystem: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function RoleMobileForm({
  form,
  isNew,
  isSystem,
  isSubmitting,
  onSubmit,
  onCancel,
  ...permissions
}: RoleMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  return (
    <MultiStepForm
      title={isNew ? "New role" : "Edit role"}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={isNew ? "Create role" : "Save changes"}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
    >
      <StepPanel id="general">
        <StepHeader
          icon={<ShieldCheck size={22} />}
          title="Role details"
          description="Create roles like Driver or HOD."
        />
        <FormGroup>
          <MobileTextField
            label="Role name"
            required
            disabled={isSystem}
            autoCapitalize="words"
            placeholder="e.g. Head Teacher, Driver"
            error={errors.name?.message}
            {...register("name")}
          />
          {isSystem && (
            <p className="px-1 text-xs text-muted-foreground">System role names cannot be changed.</p>
          )}
          <MobileTextArea
            label="Description"
            placeholder="What can this role do?"
            error={errors.description?.message}
            {...register("description")}
          />
          <ControlledToggleRow control={control} name="is_active" label="Active" />
        </FormGroup>
      </StepPanel>

      <StepPanel id="permissions">
        <StepHeader
          icon={<Lock size={22} />}
          title="Permissions"
          description="What this role is allowed to do."
        />
        <PermissionMatrix {...permissions} />
      </StepPanel>
    </MultiStepForm>
  );
}

export interface RoleMobileViewProps {
  name: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  groupedPermissions: GroupedPermissions;
  selectedPermissionIds: Set<string>;
  onEdit: () => void;
}

export function RoleMobileView({
  name,
  description,
  isActive,
  isSystem,
  groupedPermissions,
  selectedPermissionIds,
  onEdit,
}: RoleMobileViewProps) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={name}
        subtitle={description}
        meta={isSystem ? "System role" : "Custom role"}
        badge={
          <div className="flex gap-1.5">
            <Badge variant={isActive ? "success" : "default"}>{isActive ? "Active" : "Inactive"}</Badge>
            {isSystem && <Badge variant="info">System</Badge>}
          </div>
        }
      />
      <DetailSection title="Permissions" icon={<Lock size={18} />}>
        <PermissionMatrix
          groupedPermissions={groupedPermissions}
          selectedPermissionIds={selectedPermissionIds}
          onTogglePermission={() => undefined}
          onToggleResourceAll={() => undefined}
          onToggleSelectAll={() => undefined}
          disabled
        />
      </DetailSection>
      <StickyActionBar>
        <Button type="button" size="lg" className="flex-1" onClick={onEdit}>
          <Pencil size={16} /> Edit role
        </Button>
      </StickyActionBar>
    </div>
  );
}
