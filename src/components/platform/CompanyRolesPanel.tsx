"use client";

import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  Div,
  FormField,
  Input,
  P,
  ResponsiveModalContainer,
  RowActions,
  Textarea,
  type ColumnDef,
} from "@/components/ui";
import type { CompanyRole } from "@/services/company-roles.service";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { TEAM_PAGE } from "@/constants";

function roleLabel(role: string): string {
  return (TEAM_PAGE.roleLabels as Record<string, string>)[role] ?? role;
}

export function CompanyRolesPanel({ onRolesChanged }: { onRolesChanged?: () => void }) {
  const {
    roles,
    catalog,
    isLoading,
    draft,
    draftError,
    isSaving,
    openRole,
    closeRole,
    updateDraft,
    togglePermission,
    saveRole,
    deleteRole,
  } = useCompanyRoles();

  const permissionLabel = useMemo(() => {
    const map = new Map<string, string>();
    catalog?.modules.forEach((m) => m.permissions.forEach((p) => map.set(p.slug, `${m.module}: ${p.label}`)));
    return map;
  }, [catalog]);

  const columns = useMemo<ColumnDef<CompanyRole>[]>(
    () => [
      { accessorKey: "name", header: "Role", meta: { primary: true } },
      {
        id: "description",
        header: "Description",
        cell: ({ row }) => row.original.description || "—",
      },
      {
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => `${row.original.permissions.length} of ${permissionLabel.size}`,
      },
      {
        id: "members",
        header: "Members",
        cell: ({ row }) => row.original.member_count,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: <Pencil size={14} />, onClick: () => openRole(row.original) },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                disabled: row.original.member_count > 0,
                confirm: { description: `Delete the ${row.original.name} role? This cannot be undone.` },
                onClick: () => void deleteRole(row.original).then(onRolesChanged),
              },
            ]}
          />
        ),
      },
    ],
    [permissionLabel, openRole, deleteRole, onRolesChanged],
  );

  return (
    <Div type="col" gap="md">
      <Div type="row" justify="between" align="center" gap="sm" className="flex-wrap">
        <P color="muted" className="text-sm">
          Create roles for your team and choose exactly which parts of the platform each role can open. Only a Super
          Admin can manage roles.
        </P>
        <Button onClick={() => openRole()}>Create Role</Button>
      </Div>

      <DataTable columns={columns} data={roles} isLoading={isLoading} emptyText="No custom roles yet" />

      {catalog && (
        <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
          <P className="text-sm font-semibold">Built-in roles</P>
          <P color="muted" className="-mt-1 text-xs">
            These fixed roles keep working as before. Use a custom role when a team member needs a different mix.
          </P>
          {catalog.built_in_roles.map((item) => (
            <Div key={item.role} type="row" gap="sm" className="flex-wrap items-center">
              <Badge variant="default">{roleLabel(item.role)}</Badge>
              <P color="muted" className="text-xs">
                {item.permissions.map((slug) => permissionLabel.get(slug) ?? slug).join(" · ")}
              </P>
            </Div>
          ))}
        </Div>
      )}

      {draft && catalog && (
        <ResponsiveModalContainer isOpen onClose={closeRole} title={draft.id ? `Edit ${draft.name}` : "Create Role"}>
          <Div type="col" gap="md" className="px-4 py-4">
            <FormField label="Role name" required>
              <Input
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                placeholder="e.g. Accounts Executive"
                maxLength={60}
              />
            </FormField>
            <FormField label="Description">
              <Textarea
                rows={2}
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                placeholder="What this role is for"
                maxLength={255}
              />
            </FormField>

            <Div type="col" gap="sm">
              <P className="text-sm font-medium">Permissions</P>
              {catalog.modules.map((group) => {
                const slugs = group.permissions.map((p) => p.slug);
                const allOn = slugs.every((slug) => draft.permissions.includes(slug));
                return (
                  <Div key={group.module} type="col" gap="xs" className="rounded-lg border border-border p-3">
                    <Div type="row" justify="between" align="center">
                      <P className="text-sm font-semibold">{group.module}</P>
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          updateDraft({
                            permissions: allOn
                              ? draft.permissions.filter((p) => !slugs.includes(p))
                              : Array.from(new Set([...draft.permissions, ...slugs])),
                          })
                        }
                      >
                        {allOn ? "Clear" : "Select all"}
                      </Button>
                    </Div>
                    {group.permissions.map((permission) => (
                      <label key={permission.slug} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={draft.permissions.includes(permission.slug)}
                          onChange={() => togglePermission(permission.slug)}
                        />
                        {permission.label}
                      </label>
                    ))}
                  </Div>
                );
              })}
            </Div>

            {draftError && <P className="text-sm text-destructive">{draftError}</P>}
          </Div>
          <Div type="row" justify="end" gap="sm" className="border-t border-border/30 px-4 py-3">
            <Button type="button" variant="outline" onClick={closeRole}>
              Cancel
            </Button>
            <Button type="button" loading={isSaving} onClick={() => void saveRole().then(onRolesChanged)}>
              {draft.id ? "Save Role" : "Create Role"}
            </Button>
          </Div>
        </ResponsiveModalContainer>
      )}
    </Div>
  );
}
