'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  CompanyRolesService,
  type CompanyRole,
  type PlatformPermissionCatalog,
} from '@/services/company-roles.service';
import { confirmCreate } from '@/components/ui/confirm-dialog';
import { errorMessage } from '@/lib/api-error';

export interface RoleDraft {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
}

const EMPTY_DRAFT: RoleDraft = { name: '', description: '', permissions: [] };

export function useCompanyRoles() {
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [catalog, setCatalog] = useState<PlatformPermissionCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState<RoleDraft | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [list, permissionCatalog] = await Promise.all([
        CompanyRolesService.list(),
        CompanyRolesService.catalog(),
      ]);
      setRoles(list);
      setCatalog(permissionCatalog);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load roles'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([CompanyRolesService.list(), CompanyRolesService.catalog()])
      .then(([list, permissionCatalog]) => {
        if (!active) return;
        setRoles(list);
        setCatalog(permissionCatalog);
      })
      .catch((err) => active && toast.error(errorMessage(err, 'Failed to load roles')))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function openRole(role?: CompanyRole) {
    setDraftError(null);
    setDraft(
      role
        ? { id: role.id, name: role.name, description: role.description ?? '', permissions: [...role.permissions] }
        : { ...EMPTY_DRAFT },
    );
  }

  function updateDraft(next: Partial<RoleDraft>) {
    setDraftError(null);
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
  }

  function togglePermission(slug: string) {
    setDraftError(null);
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            permissions: prev.permissions.includes(slug)
              ? prev.permissions.filter((p) => p !== slug)
              : [...prev.permissions, slug],
          }
        : prev,
    );
  }

  async function saveRole() {
    if (!draft) return;
    if (!draft.name.trim()) return setDraftError('Give the role a name');
    if (!draft.permissions.length) return setDraftError('Select at least one permission');
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      permissions: draft.permissions,
    };
    if (!draft.id && !(await confirmCreate(`role "${payload.name}"`))) return;
    setIsSaving(true);
    try {
      if (draft.id) {
        await CompanyRolesService.update(draft.id, payload);
        toast.success(`${payload.name} updated — team members with this role get the change immediately`);
      } else {
        await CompanyRolesService.create(payload);
        toast.success(`${payload.name} created`);
      }
      setDraft(null);
      await refresh();
    } catch (err) {
      setDraftError(errorMessage(err, 'Failed to save role'));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRole(role: CompanyRole) {
    try {
      await CompanyRolesService.remove(role.id);
      toast.success(`${role.name} deleted`);
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete role'));
    }
  }

  return {
    roles,
    catalog,
    isLoading,
    draft,
    draftError,
    isSaving,
    openRole,
    closeRole: () => setDraft(null),
    updateDraft,
    togglePermission,
    saveRole,
    deleteRole,
    refresh,
  };
}
