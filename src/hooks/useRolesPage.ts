'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RolesService, type Role } from '@/services/roles.service';
import { ROUTES } from '@/constants';

export function useRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await RolesService.list({ limit: 100 });
      setRoles(result.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function removeRole(id: string) {
    try {
      await RolesService.remove(id);
      toast.success('Role deleted');
      await fetchRoles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete role');
    }
  }

  function navigateToNew() { router.push('/school/roles/create-new'); }
  function navigateToEdit(id: string) { router.push(`/school/roles/view?id=${id}&edit=true`); }

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  return { roles, isLoading, removeRole, navigateToNew, navigateToEdit };
}
