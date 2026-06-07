'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DepartmentsService, type Department } from '@/services/departments.service';
import type { CrudDropdownItem } from '@/components/ui/crud-dropdown';

export function useDepartmentCrudSelect() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DepartmentsService.list({ limit: 100 });
      setDepartments(result.items);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  async function addDepartment(name: string) {
    try {
      await DepartmentsService.create({ name });
      await fetchDepartments();
      toast.success(`${name} added`);
    } catch {
      toast.error('Failed to add department');
    }
  }

  async function updateDepartment(id: string, name: string) {
    try {
      await DepartmentsService.update(id, { name });
      await fetchDepartments();
      toast.success('Department updated');
    } catch {
      toast.error('Failed to update department');
    }
  }

  async function deleteDepartment(id: string) {
    try {
      await DepartmentsService.remove(id);
      await fetchDepartments();
      toast.success('Department deleted');
    } catch {
      toast.error('Failed to delete department');
    }
  }

  const departmentItems: CrudDropdownItem[] = departments.map((d) => ({ id: d.id, name: d.name }));

  return {
    departmentItems,
    isDepartmentsLoading: isLoading,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  };
}
