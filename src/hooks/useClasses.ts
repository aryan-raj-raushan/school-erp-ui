'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClassesService, SectionsService } from '@/services/classes.service';
import { ROUTES } from '@/constants';
import type { Class, Section, PaginationMeta } from '@/types';

export function useClasses(academicYearId?: string) {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ClassesService.list(
        academicYearId ? { academic_year_id: academicYearId } : {},
      );
      setClasses(result.items);
      setSections(result.sections);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  }, [academicYearId]);

  async function removeClass(classId: string) {
    try {
      await ClassesService.remove(classId);
      toast.success('Class deleted');
      await fetchClasses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete class');
    }
  }

  async function removeSection(sectionId: string) {
    try {
      await SectionsService.remove(sectionId);
      toast.success('Section deleted');
      await fetchClasses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete section');
    }
  }

  function sectionsForClass(classId: string): Section[] {
    return sections.filter((s) => s.class_id === classId);
  }

  function navigateToNew() {
    router.push(ROUTES.classNew);
  }

  function navigateToEdit(classId: string) {
    router.push(ROUTES.classEdit(classId));
  }

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  return {
    classes,
    sections,
    pagination,
    isLoading,
    sectionsForClass,
    removeClass,
    removeSection,
    navigateToNew,
    navigateToEdit,
    refetch: fetchClasses,
  };
}
