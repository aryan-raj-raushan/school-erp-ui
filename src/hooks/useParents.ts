'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StudentsService, type GuardianRow, type AddGuardianPayload } from '@/services/students-v2.service';
import type { StudentListItem } from '@/types/students.types';

const guardianSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'GRANDPARENT', 'SIBLING', 'OTHER']),
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().optional(),
  phone_number: z.string().min(7, 'Valid phone required'),
  dial_code: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().optional(),
  is_primary: z.boolean().optional(),
  can_pickup: z.boolean().optional(),
});

export type GuardianFormValues = z.infer<typeof guardianSchema>;

interface GuardianFilters {
  search?: string;
}

export function useParents(initialFilters: GuardianFilters = {}) {
  const [parents, setParents] = useState<GuardianRow[]>([]);
  const [filters, setFilters] = useState<GuardianFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal] = useState(false);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: { dial_code: '+91', is_primary: true, can_pickup: true, relation: 'FATHER' },
  });

  const fetchParents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StudentsService.listAllGuardians({ search: filters.search });
      setParents(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load guardians');
    } finally {
      setIsLoading(false);
    }
  }, [filters.search]);

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const res = await StudentsService.list({ limit: 500 });
      setStudents(res.items);
    } catch {
      // non-critical
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  async function createGuardian(values: GuardianFormValues) {
    try {
      const payload: AddGuardianPayload = {
        relation: values.relation,
        first_name: values.first_name,
        phone_number: values.phone_number,
        dial_code: values.dial_code ?? '+91',
        ...(values.last_name && { last_name: values.last_name }),
        ...(values.email && { email: values.email }),
        ...(values.occupation && { occupation: values.occupation }),
        is_primary: values.is_primary ?? false,
        can_pickup: values.can_pickup ?? false,
      };
      await StudentsService.addGuardian(values.student_id, payload);
      toast.success(`${values.first_name} added as guardian`);
      await fetchParents();
      setShowModal(false);
      form.reset({ dial_code: '+91', is_primary: true, can_pickup: true, relation: 'FATHER' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add guardian');
    }
  }

  async function deleteParent(id: string) {
    try {
      await StudentsService.removeGuardian(id);
      toast.success('Guardian removed');
      setParents((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  function updateFilters(next: Partial<GuardianFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  function openModal() {
    fetchStudents();
    setShowModal(true);
  }

  useEffect(() => { fetchParents(); }, [fetchParents]);

  // Stub for bulk/link features that don't apply to this new flow
  const pagination = { total: parents.length, page: 1, totalPages: 1 };

  return {
    parents,
    pagination,
    filters,
    isLoading,
    showModal,
    openModal,
    closeModal: () => { setShowModal(false); form.reset(); },
    form,
    handleSubmit: form.handleSubmit(createGuardian),
    isSubmitting: form.formState.isSubmitting,
    showEditModal,
    openEditModal: () => {},
    closeEditModal: () => {},
    editForm: form,
    handleEditSubmit: form.handleSubmit(createGuardian),
    isEditSubmitting: false,
    deleteParent,
    students,
    studentsLoading,
    linkClasses: [],
    linkSections: [],
    showLinkModal: false,
    linkingParent: null,
    openLinkModal: () => {},
    closeLinkModal: () => {},
    linkForm: form,
    handleLinkSubmit: form.handleSubmit(createGuardian),
    isLinkSubmitting: false,
    showBulkModal: false,
    openBulkModal: () => {},
    closeBulkModal: () => {},
    bulkJob: null,
    bulkFileRef: { current: null },
    isImporting: false,
    bulkImport: async () => {},
    checkBulkStatus: async () => {},
    downloadTemplate: async () => {},
    updateFilters,
    refetch: fetchParents,
  };
}
