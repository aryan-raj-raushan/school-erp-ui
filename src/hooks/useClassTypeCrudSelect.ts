'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ClassTypesService, type ClassTypeItem } from '@/services/class-types.service';
import type { CrudDropdownItem } from '@/components/ui/crud-dropdown';

export function useClassTypeCrudSelect() {
  const [classTypesList, setClassTypesList] = useState<ClassTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClassTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ClassTypesService.list({ limit: 100 });
      setClassTypesList(result.items);
    } catch {
      toast.error('Failed to load class types');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchClassTypes(); }, [fetchClassTypes]);

  async function addClassType(name: string) {
    try {
      await ClassTypesService.create({ name });
      await fetchClassTypes();
      toast.success(`${name} added`);
    } catch {
      toast.error('Failed to add class type');
    }
  }

  async function updateClassType(id: string, name: string) {
    try {
      await ClassTypesService.update(id, { name });
      await fetchClassTypes();
      toast.success('Class type updated');
    } catch {
      toast.error('Failed to update class type');
    }
  }

  async function deleteClassType(id: string) {
    try {
      await ClassTypesService.remove(id);
      await fetchClassTypes();
      toast.success('Class type deleted');
    } catch {
      toast.error('Failed to delete class type');
    }
  }

  const classTypeItems: CrudDropdownItem[] = classTypesList.map((ct) => ({ id: ct.id, name: ct.name }));

  return {
    classTypeItems,
    isClassTypesLoading: isLoading,
    addClassType,
    updateClassType,
    deleteClassType,
  };
}
