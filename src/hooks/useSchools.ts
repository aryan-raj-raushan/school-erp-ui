'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SchoolsService, type SchoolFilters, type CreateSchoolPayload, type UpdateSchoolPayload } from '@/services/schools.service';
import { AuthService } from '@/services/auth.service';
import { AuthContext } from '@/lib/api-gateway/token.storage';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';
import {
  createSchoolSchema,
  updateSchoolSchema,
  type CreateSchoolFormValues,
  type UpdateSchoolFormValues,
} from '@/lib/validations/schools.validation';
import type { PaginationMeta, School } from '@/types';

export function useSchools(initialFilters: SchoolFilters = {}) {
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<SchoolFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const { setAuth } = useAuthStore();
  const router = useRouter();

  const createForm = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { dial_code: '+91' },
  });

  const editForm = useForm<UpdateSchoolFormValues>({
    resolver: zodResolver(updateSchoolSchema),
  });

  const fetchSchools = useCallback(async (overrideFilters?: SchoolFilters) => {
    setIsLoading(true);
    try {
      const result = await SchoolsService.list(overrideFilters ?? filters);
      setSchools(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function handleCreateSubmit(values: CreateSchoolFormValues) {
    const payload: CreateSchoolPayload = {
      name: values.name,
      ...(values.code && { code: values.code }),
      ...(values.email && { email: values.email }),
      ...(values.contact_number && { contact_number: values.contact_number, dial_code: values.dial_code }),
      ...(values.website && { website: values.website }),
      ...(values.address && { address: values.address }),
      ...(values.city && { city: values.city }),
      ...(values.state && { state: values.state }),
      ...(values.pincode && { pincode: values.pincode }),
      ...(values.board_type && { board_type: values.board_type }),
    };
    try {
      const school = await SchoolsService.create(payload);
      toast.success(`${school.name} created`);
      await fetchSchools();
      setShowCreateModal(false);
      createForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create school');
    }
  }

  async function handleEditSubmit(values: UpdateSchoolFormValues) {
    if (!editingSchool) return;
    const payload: UpdateSchoolPayload = {
      ...(values.name && { name: values.name }),
      ...(values.code && { code: values.code }),
      ...(values.email && { email: values.email }),
      ...(values.contact_number && { contact_number: values.contact_number, dial_code: values.dial_code }),
      ...(values.website && { website: values.website }),
      ...(values.address && { address: values.address }),
      ...(values.city && { city: values.city }),
      ...(values.state && { state: values.state }),
      ...(values.pincode && { pincode: values.pincode }),
      ...(values.board_type && { board_type: values.board_type }),
    };
    try {
      const school = await SchoolsService.update(editingSchool.id, payload);
      toast.success(`${school.name} updated`);
      await fetchSchools();
      setEditingSchool(null);
      editForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update school');
    }
  }

  async function deleteSchool(school: School) {
    if (!confirm(`Delete "${school.name}"? This cannot be undone.`)) return;
    try {
      await SchoolsService.remove(school.id);
      toast.success('School deleted');
      await fetchSchools();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete school');
    }
  }

  async function loginAsSchool(school: School) {
    setSwitchingId(school.id);
    try {
      const result = await AuthService.switchSchool(school.id);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
      void result;
      router.replace(ROUTES.schoolDashboard);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to switch school');
    } finally {
      setSwitchingId(null);
    }
  }

  function openCreateModal() {
    createForm.reset({ dial_code: '+91' });
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    createForm.reset();
  }

  function openEditModal(school: School) {
    editForm.reset({
      name: school.name,
      code: school.code ?? '',
      email: school.email ?? '',
      dial_code: school.dial_code ?? '+91',
      contact_number: school.contact_number ?? '',
      website: school.website ?? '',
      address: school.address ?? '',
      city: school.city ?? '',
      state: school.state ?? '',
      pincode: school.pincode ?? '',
      board_type: (school.board_type as any) ?? undefined,
    });
    setEditingSchool(school);
  }

  function closeEditModal() {
    setEditingSchool(null);
    editForm.reset();
  }

  function updateFilters(next: Partial<SchoolFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  return {
    schools, pagination, filters, isLoading,
    switchingId,
    showCreateModal,
    openCreateModal,
    closeCreateModal,
    createForm,
    handleCreateSubmit: createForm.handleSubmit(handleCreateSubmit),
    isCreating: createForm.formState.isSubmitting,
    editingSchool,
    openEditModal,
    closeEditModal,
    editForm,
    handleEditSubmit: editForm.handleSubmit(handleEditSubmit),
    isUpdating: editForm.formState.isSubmitting,
    deleteSchool,
    loginAsSchool,
    updateFilters,
  };
}
