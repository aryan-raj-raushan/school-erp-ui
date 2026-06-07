'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DepartmentsService, type Department } from '@/services/departments.service';
import { ROUTES } from '@/constants';
import type { PaginationMeta } from '@/types';

export function useDepartments() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DepartmentsService.list({ limit: 100 });
      setDepartments(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function removeDepartment(id: string) {
    try {
      await DepartmentsService.remove(id);
      toast.success('Department deleted');
      await fetchDepartments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete department');
    }
  }

  function navigateToNew() {
    router.push(ROUTES.departmentNew);
  }

  function navigateToEdit(id: string) {
    router.push(ROUTES.departmentEdit(id));
  }

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  return {
    departments,
    pagination,
    isLoading,
    removeDepartment,
    navigateToNew,
    navigateToEdit,
    refetch: fetchDepartments,
  };
}
