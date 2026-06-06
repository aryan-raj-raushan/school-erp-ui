'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ParentService, type CreateParentPayload, type UpdateParentPayload, type ParentFilters } from '@/services/parent.service';
import { StudentsService } from '@/services/students.service';
import { ClassesService } from '@/services/classes.service';
import type { SchoolParent, Student, Class, Section, PaginationMeta, BulkImportJob } from '@/types';

const parentSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone_number: z.string().optional(),
  dial_code: z.string().optional(),
  occupation: z.string().optional(),
});

const linkStudentSchema = z.object({
  student_id: z.string().min(1, 'Student ID required'),
});

export type ParentFormValues = z.infer<typeof parentSchema>;
export type LinkStudentFormValues = z.infer<typeof linkStudentSchema>;

export function useParents(initialFilters: ParentFilters = {}) {
  const [parents, setParents] = useState<SchoolParent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<ParentFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParent, setEditingParent] = useState<SchoolParent | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingParent, setLinkingParent] = useState<SchoolParent | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [linkClasses, setLinkClasses] = useState<Class[]>([]);
  const [linkSections, setLinkSections] = useState<Section[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJob, setBulkJob] = useState<BulkImportJob | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: { dial_code: '+91' },
  });

  const editForm = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
  });

  const linkForm = useForm<LinkStudentFormValues>({
    resolver: zodResolver(linkStudentSchema),
  });

  const fetchParents = useCallback(async (overrideFilters?: ParentFilters) => {
    setIsLoading(true);
    try {
      const result = await ParentService.list(overrideFilters ?? filters);
      setParents(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load parents');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function createParent(values: ParentFormValues) {
    const payload: CreateParentPayload = {
      first_name: values.first_name,
      ...(values.last_name && { last_name: values.last_name }),
      ...(values.email && { email: values.email }),
      ...(values.phone_number && { phone_number: values.phone_number, dial_code: values.dial_code ?? '+91' }),
      ...(values.occupation && { occupation: values.occupation }),
    };
    const parent = await ParentService.create(payload);
    toast.success(`${parent.first_name} added`);
    await fetchParents();
    setShowModal(false);
    form.reset();
  }

  async function updateParent(values: ParentFormValues) {
    if (!editingParent) return;
    const payload: UpdateParentPayload = {
      first_name: values.first_name,
      ...(values.last_name && { last_name: values.last_name }),
      ...(values.email && { email: values.email }),
      ...(values.phone_number && { phone_number: values.phone_number, dial_code: values.dial_code ?? '+91' }),
      ...(values.occupation && { occupation: values.occupation }),
    };
    const parent = await ParentService.update(editingParent.id, payload);
    toast.success(`${parent.first_name} updated`);
    await fetchParents();
    setShowEditModal(false);
    setEditingParent(null);
    editForm.reset();
  }

  async function deleteParent(id: string) {
    try {
      await ParentService.remove(id);
      toast.success('Parent deleted');
      await fetchParents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function linkStudent(values: LinkStudentFormValues) {
    if (!linkingParent) return;
    try {
      await ParentService.linkStudent(linkingParent.id, values.student_id);
      toast.success('Student linked');
      setShowLinkModal(false);
      setLinkingParent(null);
      linkForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to link student');
    }
  }

  function openEditModal(parent: SchoolParent) {
    setEditingParent(parent);
    editForm.reset({
      first_name: parent.first_name,
      last_name: parent.last_name ?? '',
      email: parent.email ?? '',
      phone_number: parent.phone_number ?? '',
      dial_code: parent.dial_code ?? '+91',
      occupation: parent.occupation ?? '',
    });
    setShowEditModal(true);
  }

  async function openLinkModal(parent: SchoolParent) {
    setLinkingParent(parent);
    linkForm.reset();
    setShowLinkModal(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        StudentsService.list({ limit: 100 }),
        ClassesService.list(),
      ]);
      setStudents(studentsRes.items);
      setLinkClasses(classesRes.items);
      setLinkSections(classesRes.sections);
    } catch {
      // non-critical; dropdown may be empty
    }
  }

  async function downloadTemplate() {
    try {
      const blob = await ParentService.downloadBulkTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parent-import-template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to download template');
    }
  }

  async function bulkImport() {
    const file = bulkFileRef.current?.files?.[0];
    if (!file) { toast.error('Select a file first'); return; }
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { jobId } = await ParentService.bulkImport(formData);
      toast.success(`Import started — Job ID: ${jobId}`);
      setBulkJob({ jobId, status: 'PENDING' });
      if (bulkFileRef.current) bulkFileRef.current.value = '';
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk import failed');
    } finally {
      setIsImporting(false);
    }
  }

  async function checkBulkStatus() {
    if (!bulkJob?.jobId) return;
    try {
      const job = await ParentService.getBulkStatus(bulkJob.jobId);
      setBulkJob(job);
      if (job.status === 'COMPLETED') {
        toast.success(`Import complete — ${job.processed ?? 0} processed`);
        await fetchParents();
        setShowBulkModal(false);
        setBulkJob(null);
      } else if (job.status === 'FAILED') {
        toast.error('Import failed');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to check status');
    }
  }

  function updateFilters(next: Partial<ParentFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchParents(); }, [fetchParents]);

  return {
    parents, pagination, filters, isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset(); },
    form,
    handleSubmit: form.handleSubmit(createParent),
    isSubmitting: form.formState.isSubmitting,
    showEditModal,
    editingParent,
    openEditModal,
    closeEditModal: () => { setShowEditModal(false); setEditingParent(null); editForm.reset(); },
    editForm,
    handleEditSubmit: editForm.handleSubmit(updateParent),
    isEditSubmitting: editForm.formState.isSubmitting,
    deleteParent,
    students,
    linkClasses,
    linkSections,
    showLinkModal,
    linkingParent,
    openLinkModal,
    closeLinkModal: () => { setShowLinkModal(false); setLinkingParent(null); linkForm.reset(); },
    linkForm,
    handleLinkSubmit: linkForm.handleSubmit(linkStudent),
    isLinkSubmitting: linkForm.formState.isSubmitting,
    showBulkModal,
    openBulkModal: () => setShowBulkModal(true),
    closeBulkModal: () => { setShowBulkModal(false); setBulkJob(null); },
    bulkJob,
    bulkFileRef,
    isImporting,
    bulkImport,
    checkBulkStatus,
    downloadTemplate,
    updateFilters,
    refetch: fetchParents,
  };
}
