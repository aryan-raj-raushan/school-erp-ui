'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { StudentMovementsService, type CreateMovementPayload } from '@/services/student-movements.service';
import type { StudentMovement } from '@/types';

export function useStudentMovements() {
  const [movements, setMovements] = useState<StudentMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const data = await StudentMovementsService.byStudent(studentId, date || undefined);
      setMovements(data);
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, date]);

  const create = useCallback(async (payload: CreateMovementPayload) => {
    setIsSubmitting(true);
    try {
      const created = await StudentMovementsService.create(payload);
      setMovements((prev) => [created, ...prev]);
      setIsDialogOpen(false);
      toast.success('Movement logged');
    } catch {
      toast.error('Failed to log movement');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await StudentMovementsService.remove(id);
      setMovements((prev) => prev.filter((m) => m.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }, []);

  return {
    movements, isLoading, isSubmitting, isDialogOpen, setIsDialogOpen,
    studentId, setStudentId, date, setDate, fetch, create, remove,
  };
}
