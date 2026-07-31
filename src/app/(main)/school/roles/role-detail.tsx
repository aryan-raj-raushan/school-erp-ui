"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, X, Lock } from "lucide-react";
import { useRoleDetail } from "@/hooks/useRoleDetail";
import { PermissionMatrix } from "@/components/ui/permission-matrix";
import {
  Div,
  H2,
  P,
  Button,
  Input,
  Textarea,
  FormField,
  Badge,
  Spinner,
  CheckboxLabel,
  PageHeader,
  PageHeaderConfig,
} from "@/components/ui";

export function RoleDetail({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const startEditing = searchParams.get("edit") === "true";

  const {
    isNew,
    isEditing,
    setIsEditing,
    isSystem,
    roleName,
    form,
    groupedPermissions,
    selectedPermissionIds,
    isLoadingData,
    togglePermission,
    toggleResourceAll,
    toggleSelectAll,
    toggleIsActive,
    isSubmitting,
    handleSubmit,
    handleBack,
    handleCancelEdit,
  } = useRoleDetail(id);

  useEffect(() => {
    if (startEditing && !isNew) setIsEditing(true);
  }, [startEditing, isNew, setIsEditing]);

  if (isLoadingData) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  const pageHeaderConfig: PageHeaderConfig = {
    title: isNew ? "Add New Role" : roleName,
    subtitle: isNew
      ? undefined
      : isSystem
        ? "System role — name is locked but permissions can be adjusted"
        : "Edit role name, description, and permissions",
    badge:
      !isNew && isSystem ? (
        <Badge variant="info">
          <Lock size={10} className="mr-1" />
          System
        </Badge>
      ) : undefined,
    backButton: true,
    actions: isNew
      ? undefined
      : isEditing
        ? [
            {
              label: "Cancel",
              icon: <X size={14} />,
              variant: "outline",
              onClick: handleCancelEdit,
            },
          ]
        : [
            {
              label: "Edit",
              icon: <Pencil size={14} />,
              onClick: () => setIsEditing(true),
            },
          ],
  };

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      {/* Header */}

      <PageHeader {...pageHeaderConfig} />

      {/* View mode */}
      {!isEditing && !isNew && (
        <Div type="col" gap="lg">
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              General
            </H2>
            <Div type="row" gap="md" align="center">
              <P color="muted" className="w-32">
                Name
              </P>
              <P>{roleName}</P>
            </Div>
            <Div type="row" gap="md" align="center">
              <P color="muted" className="w-32">
                Status
              </P>
              <Badge
                variant={form.getValues("is_active") ? "success" : "default"}
              >
                {form.getValues("is_active") ? "Active" : "Inactive"}
              </Badge>
            </Div>
            {form.getValues("description") && (
              <Div type="row" gap="md">
                <P color="muted" className="w-32 shrink-0">
                  Description
                </P>
                <P>{form.getValues("description")}</P>
              </Div>
            )}
          </Div>

          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Permissions
            </H2>
            <PermissionMatrix
              groupedPermissions={groupedPermissions}
              selectedPermissionIds={selectedPermissionIds}
              onTogglePermission={() => {}}
              onToggleResourceAll={() => {}}
              onToggleSelectAll={() => {}}
              disabled
            />
          </Div>
        </Div>
      )}

      {/* Create / Edit form */}
      {(isEditing || isNew) && (
        <form onSubmit={handleSubmit}>
          <Div type="col" gap="lg">
            {/* General section */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                General Information
              </H2>

              <FormField
                label="Role Name *"
                error={form.formState.errors.name?.message}
              >
                <Input
                  placeholder="e.g. Head Teacher, Driver, Lab Assistant"
                  disabled={isSystem}
                  {...form.register("name")}
                />
                {isSystem && (
                  <P color="muted" className="text-xs mt-1">
                    System role names cannot be changed.
                  </P>
                )}
              </FormField>

              <FormField
                label="Description"
                error={form.formState.errors.description?.message}
              >
                <Textarea
                  placeholder="What can this role do?"
                  {...form.register("description")}
                />
              </FormField>

              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.watch("is_active")}
                  onChange={toggleIsActive}
                />
                <CheckboxLabel htmlFor="is_active">Active</CheckboxLabel>
              </Div>
            </Div>

            {/* Permissions section */}
            <Div
              type="col"
              gap="sm"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Permissions
              </H2>
              <P color="muted" className="text-sm mb-2">
                Select which actions this role can perform.
              </P>
              <PermissionMatrix
                groupedPermissions={groupedPermissions}
                selectedPermissionIds={selectedPermissionIds}
                onTogglePermission={togglePermission}
                onToggleResourceAll={toggleResourceAll}
                onToggleSelectAll={toggleSelectAll}
              />
            </Div>

            {/* Actions */}
            <Div type="row" justify="end" gap="sm">
              <Button
                variant="outline"
                type="button"
                onClick={isNew ? handleBack : handleCancelEdit}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isNew ? "Create Role" : "Save Changes"}
              </Button>
            </Div>
          </Div>
        </form>
      )}
    </Div>
  );
}
