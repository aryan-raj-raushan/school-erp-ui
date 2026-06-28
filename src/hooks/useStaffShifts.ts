'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { StaffShiftsService } from '@/services/staff-shifts.service';
import { StaffService } from '@/services/staff.service';
import { STAFF_SHIFTS_PAGE } from '@/constants/staff-shifts.constants';
import type { StaffShift, CreateStaffShiftPayload, UpdateStaffShiftPayload } from '@/types/staff-shifts.types';
import type { Staff } from '@/types';

export function useStaffShifts() {
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<StaffShift | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [shiftData, staffResponse] = await Promise.all([
        StaffShiftsService.list(),
        StaffService.list(),
      ]);
      setShifts(shiftData);
      setStaff(staffResponse.items);
    } catch {
      toast.error('Failed to load staff shifts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getStaffName = useCallback(
    (staffId: string) => {
      const s = staff.find((m) => m.id === staffId);
      return s ? `${s.first_name} ${s.last_name ?? ''}`.trim() : staffId;
    },
    [staff],
  );

  const openCreate = useCallback(() => {
    setEditingShift(null);
    setIsDialogOpen(true);
  }, []);

  const openEdit = useCallback((shift: StaffShift) => {
    setEditingShift(shift);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingShift(null);
  }, []);

  const create = useCallback(async (payload: CreateStaffShiftPayload) => {
    setIsSubmitting(true);
    try {
      const created = await StaffShiftsService.create(payload);
      setShifts((prev) => [...prev, created]);
      toast.success(`${STAFF_SHIFTS_PAGE.title} — shift assigned`);
      closeDialog();
    } catch {
      toast.error('Failed to assign shift');
    } finally {
      setIsSubmitting(false);
    }
  }, [closeDialog]);

  const update = useCallback(async (id: string, payload: UpdateStaffShiftPayload) => {
    setIsSubmitting(true);
    try {
      const updated = await StaffShiftsService.update(id, payload);
      setShifts((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Shift updated');
      closeDialog();
    } catch {
      toast.error('Failed to update shift');
    } finally {
      setIsSubmitting(false);
    }
  }, [closeDialog]);

  const remove = useCallback(async (id: string) => {
    try {
      await StaffShiftsService.delete(id);
      setShifts((prev) => prev.filter((s) => s.id !== id));
      toast.success('Shift deleted');
    } catch {
      toast.error('Failed to delete shift');
    }
  }, []);

  const submit = useCallback(
    async (payload: CreateStaffShiftPayload) => {
      if (editingShift) {
        await update(editingShift.id, payload);
      } else {
        await create(payload);
      }
    },
    [editingShift, update, create],
  );

  return {
    shifts,
    staff,
    isLoading,
    isSubmitting,
    isDialogOpen,
    editingShift,
    getStaffName,
    openCreate,
    openEdit,
    closeDialog,
    submit,
    remove,
  };
}
