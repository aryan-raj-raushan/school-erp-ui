'use client';

import { Div, Spinner } from '@/components/ui';
import { type GroupedPermissions } from '@/services/permissions.service';
import { RESOURCE_LABELS, ACTION_LABELS } from '@/constants/permissions.registry';

interface PermissionMatrixProps {
  groupedPermissions: GroupedPermissions;
  selectedPermissionIds: Set<string>;
  isLoading?: boolean;
  disabled?: boolean;
  onTogglePermission: (id: string) => void;
  onToggleResourceAll: (resource: string) => void;
  onToggleSelectAll: () => void;
}

function resourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PermissionMatrix({
  groupedPermissions,
  selectedPermissionIds,
  isLoading,
  disabled,
  onTogglePermission,
  onToggleResourceAll,
  onToggleSelectAll,
}: PermissionMatrixProps) {
  const allIds = Object.values(groupedPermissions).flatMap((p) => p.map((x) => x.id));
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedPermissionIds.has(id));

  if (isLoading) return <Div type="col" align="center" gap="md"><Spinner /></Div>;

  return (
    <Div type="col" gap="sm">
      <Div type="row" align="center" gap="sm" className="pb-2 border-b">
        <input
          type="checkbox"
          id="select-all"
          checked={allSelected}
          onChange={onToggleSelectAll}
          disabled={disabled}
          className="h-4 w-4 rounded"
        />
        <label htmlFor="select-all" className="text-sm font-semibold cursor-pointer select-none">
          Select All Permissions
        </label>
        <span className="text-xs text-muted-foreground ml-2">
          ({selectedPermissionIds.size} / {allIds.length} selected)
        </span>
      </Div>

      {Object.entries(groupedPermissions).map(([resource, perms]) => {
        const resourceIds = perms.map((p) => p.id);
        const allResourceSelected = resourceIds.every((id) => selectedPermissionIds.has(id));
        const someResourceSelected = resourceIds.some((id) => selectedPermissionIds.has(id));

        return (
          <Div key={resource} type="col" gap="xs" className="p-3 rounded-lg border bg-card">
            <Div type="row" align="center" gap="sm" className="mb-2">
              <input
                type="checkbox"
                id={`resource-${resource}`}
                checked={allResourceSelected}
                ref={(el) => { if (el) el.indeterminate = someResourceSelected && !allResourceSelected; }}
                onChange={() => onToggleResourceAll(resource)}
                disabled={disabled}
                className="h-4 w-4 rounded"
              />
              <label htmlFor={`resource-${resource}`} className="text-sm font-semibold cursor-pointer select-none">
                {resourceLabel(resource)}
              </label>
            </Div>

            <Div type="row" gap="md" className="flex-wrap pl-6">
              {perms.map((perm) => (
                <Div key={perm.id} type="row" align="center" gap="xs">
                  <input
                    type="checkbox"
                    id={`perm-${perm.id}`}
                    checked={selectedPermissionIds.has(perm.id)}
                    onChange={() => onTogglePermission(perm.id)}
                    disabled={disabled}
                    className="h-3.5 w-3.5 rounded"
                  />
                  <label htmlFor={`perm-${perm.id}`} className="text-xs cursor-pointer select-none text-muted-foreground">
                    {actionLabel(perm.action)}
                  </label>
                </Div>
              ))}
            </Div>
          </Div>
        );
      })}
    </Div>
  );
}
