'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { ROUTES } from '@/constants';
import type { PaginationMeta } from '@/types';

export function useClassDetails() {
  const router = useRouter();
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClassDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ClassDetailsService.list();
      setClassDetails(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load class details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function removeClassDetail(id: string) {
    try {
      await ClassDetailsService.remove(id);
      toast.success('Class detail deleted');
      await fetchClassDetails();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  function navigateToNew() {
    router.push(ROUTES.classDetailNew);
  }

  function navigateToEdit(id: string) {
    router.push(ROUTES.classDetailEdit(id));
  }

  useEffect(() => { fetchClassDetails(); }, [fetchClassDetails]);

  return {
    classDetails,
    pagination,
    isLoading,
    removeClassDetail,
    navigateToNew,
    navigateToEdit,
    refetch: fetchClassDetails,
  };
}
