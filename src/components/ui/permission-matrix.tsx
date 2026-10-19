'use client';

import { Div, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';
import { useIsMobileSync } from '@/hooks/useIsMobileSync';
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

  const isMobile = useIsMobileSync();

  if (isLoading) return <Div type="col" align="center" gap="md"><Spinner /></Div>;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            void haptic('light');
            onToggleSelectAll();
          }}
          className="flex h-12 items-center justify-between rounded-2xl border border-border bg-white px-4 text-left disabled:opacity-60 dark:bg-neutral-900"
        >
          <span className="text-sm font-semibold">
            {allSelected ? 'Clear all permissions' : 'Select all permissions'}
          </span>
          <span className="text-xs text-muted-foreground">
            {selectedPermissionIds.size} / {allIds.length}
          </span>
        </button>

        {Object.entries(groupedPermissions).map(([resource, perms]) => {
          const resourceIds = perms.map((p) => p.id);
          const selectedCount = resourceIds.filter((id) => selectedPermissionIds.has(id)).length;
          const allResourceSelected = selectedCount === resourceIds.length;
          return (
            <section
              key={resource}
              className="rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900"
            >
              <header className="mb-2 flex items-center justify-between gap-2 px-1">
                <h4 className="text-sm font-semibold">{resourceLabel(resource)}</h4>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    void haptic('light');
                    onToggleResourceAll(resource);
                  }}
                  className="h-9 rounded-full px-3 text-xs font-semibold text-primary-text active:bg-muted disabled:opacity-60"
                >
                  {allResourceSelected ? 'Clear' : 'Select all'} · {selectedCount}/{resourceIds.length}
                </button>
              </header>
              <div className="flex flex-wrap gap-2">
                {perms.map((perm) => {
                  const selected = selectedPermissionIds.has(perm.id);
                  return (
                    <button
                      key={perm.id}
                      type="button"
                      aria-pressed={selected}
                      disabled={disabled}
                      onClick={() => {
                        void haptic('light');
                        onTogglePermission(perm.id);
                      }}
                      className={cn(
                        'h-10 rounded-full border px-4 text-sm font-medium transition-colors active:scale-95 disabled:opacity-60',
                        selected
                          ? 'border-primary bg-primary/10 text-primary-text'
                          : 'border-border text-muted-foreground',
                      )}
                    >
                      {actionLabel(perm.action)}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

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
