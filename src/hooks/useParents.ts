'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { StudentsService, type GuardianRow, type AddGuardianPayload } from '@/services/students-v2.service';
import type { StudentListItem } from '@/types/students.types';
import { guardianSchema, type GuardianFormValues } from '@/lib/validations/parents.validation';
import { useAcademicYears } from './useAcademicYears';
import { useClassSections } from './useClassSections';

export type { GuardianFormValues };

interface GuardianFilters {
  search?: string;
  relation?: string;
  is_primary?: string;
  can_pickup?: string;
}

export function useParents(initialFilters: GuardianFilters = {}) {
  const [parents, setParents] = useState<GuardianRow[]>([]);
  const [filters, setFilters] = useState<GuardianFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal] = useState(false);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const { years, currentYear } = useAcademicYears();
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const { classes, sections } = useClassSections(selectedYearId, selectedClassId);

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

  // Preselect the current academic year once the modal is opened and years have loaded
  useEffect(() => {
    if (showModal && currentYear && !selectedYearId) setSelectedYearId(currentYear.id);
  }, [showModal, currentYear, selectedYearId]);

  // Students load only once a class is chosen — keeps the picker scoped and fast
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    setStudentsLoading(true);
    StudentsService.list({ class_id: selectedClassId, section_id: selectedSectionId || undefined, limit: 500 })
      .then((res) => setStudents(res.items))
      .catch(() => {})
      .finally(() => setStudentsLoading(false));
  }, [selectedClassId, selectedSectionId]);

  function handleYearChange(id: string) {
    setSelectedYearId(id);
    setSelectedClassId('');
    setSelectedSectionId('');
    form.setValue('student_id', '');
  }

  function handleClassChange(id: string) {
    setSelectedClassId(id);
    setSelectedSectionId('');
    form.setValue('student_id', '');
  }

  function handleSectionChange(id: string) {
    setSelectedSectionId(id);
    form.setValue('student_id', '');
  }

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

  function resetCascade() {
    setSelectedYearId('');
    setSelectedClassId('');
    setSelectedSectionId('');
    setStudents([]);
  }

  function openModal() {
    resetCascade();
    setShowModal(true);
  }

  useEffect(() => { fetchParents(); }, [fetchParents]);

  // Relation/primary/pickup filters apply client-side — the list endpoint only supports `search`
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      if (filters.relation && p.relation !== filters.relation) return false;
      if (filters.is_primary && String(p.is_primary) !== filters.is_primary) return false;
      if (filters.can_pickup && String(p.can_pickup) !== filters.can_pickup) return false;
      return true;
    });
  }, [parents, filters.relation, filters.is_primary, filters.can_pickup]);

  // Stub for bulk/link features that don't apply to this new flow
  const pagination = { total: filteredParents.length, page: 1, totalPages: 1 };

  return {
    parents: filteredParents,
    pagination,
    filters,
    isLoading,
    showModal,
    openModal,
    closeModal: () => { setShowModal(false); form.reset(); resetCascade(); },
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
    years,
    classes,
    sections,
    selectedYearId,
    selectedClassId,
    selectedSectionId,
    handleYearChange,
    handleClassChange,
    handleSectionChange,
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
