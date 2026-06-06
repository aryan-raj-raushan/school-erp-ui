'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StudyMaterialsService, type CreateStudyMaterialPayload } from '@/services/study-materials.service';
import { ClassesService } from '@/services/classes.service';
import { ClassSubjectsService } from '@/services/class-subject.service';
import { UploadsService } from '@/services/uploads.service';
import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import { useAcademicYears } from './useAcademicYears';
import type { StudyMaterial, Class, Section } from '@/types';

const matSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  file_url: z.string().optional(),
  file_type: z.string().optional(),
});

export type MaterialFormValues = z.infer<typeof matSchema>;

export function useStudyMaterials() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<MaterialFormValues>({ resolver: zodResolver(matSchema) });

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) setSelectedAcademicYearId(currentYear.id);
  }, [currentYear, selectedAcademicYearId]);

  const fetchClasses = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const res = await ClassesService.list({ academic_year_id: selectedAcademicYearId });
      setClasses(res.items);
      setAllSections(res.sections);
    } catch { /* ignore */ }
  }, [selectedAcademicYearId]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  async function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedSectionId('');
    setSelectedSubjectId('');
    setSections(classId ? allSections.filter((s) => s.class_id === classId) : []);
    setSubjects([]);
    setMaterials([]);
  }

  async function handleSectionChange(sectionId: string) {
    setSelectedSectionId(sectionId);
    setSelectedSubjectId('');
    setSubjects([]);
    setMaterials([]);
    if (!sectionId) return;
    try {
      const res = await ClassSubjectsService.list({ class_section_id: sectionId, limit: 100 });
      const items: any[] = res.data?.items ?? [];
      if (items.length > 0) {
        setSubjects(items.map((cs) => ({ id: cs.subject_id, name: cs.subject_name })));
      } else {
        const masterRes = await apiGateway.get<any[]>(ENDPOINTS.masterData.subjects, { params: { limit: 200 } });
        setSubjects((masterRes.data ?? []).map((s: any) => ({ id: s.id, name: s.subject_name })));
      }
    } catch { /* ignore */ }
  }

  const fetchMaterials = useCallback(async () => {
    if (!selectedSectionId || !selectedAcademicYearId) return;
    setIsLoading(true);
    try {
      const data = await StudyMaterialsService.list({
        class_section_id: selectedSectionId,
        subject_id: selectedSubjectId || undefined,
        academic_year_id: selectedAcademicYearId,
      });
      setMaterials(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSectionId, selectedSubjectId, selectedAcademicYearId]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  function openAddModal() {
    setEditingId(null);
    form.reset({ title: '', description: '', file_url: '', file_type: '' });
    setShowModal(true);
  }

  function openEditModal(mat: StudyMaterial) {
    setEditingId(mat.id);
    form.reset({
      title: mat.title,
      description: mat.description ?? '',
      file_url: mat.file_url,
      file_type: mat.file_type ?? '',
    });
    setShowModal(true);
  }

  async function handleSubmit(values: MaterialFormValues) {
    if (!selectedSectionId || !selectedAcademicYearId || !selectedSubjectId) {
      toast.error('Select section and subject first');
      return;
    }
    setIsSaving(true);
    try {
      let fileUrl = values.file_url ?? '';
      let fileType = values.file_type ?? '';
      const file = fileRef.current?.files?.[0];
      if (file) {
        setIsUploading(true);
        const result = await UploadsService.uploadDocument(file);
        fileUrl = result.url;
        fileType = file.type;
        setIsUploading(false);
      }
      if (!fileUrl) { toast.error('File URL required'); setIsSaving(false); return; }
      const payload: CreateStudyMaterialPayload = {
        academic_year_id: selectedAcademicYearId,
        class_section_id: selectedSectionId,
        subject_id: selectedSubjectId,
        title: values.title,
        description: values.description,
        file_url: fileUrl,
        file_type: fileType || undefined,
      };
      if (editingId) {
        await StudyMaterialsService.update(editingId, payload);
        toast.success('Material updated');
      } else {
        await StudyMaterialsService.create(payload);
        toast.success('Material uploaded');
      }
      setShowModal(false);
      await fetchMaterials();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this material?')) return;
    try {
      await StudyMaterialsService.remove(id);
      toast.success('Material deleted');
      await fetchMaterials();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return {
    years,
    selectedAcademicYearId, setSelectedAcademicYearId,
    classes, sections, subjects,
    selectedClassId, selectedSectionId, selectedSubjectId,
    setSelectedSubjectId,
    handleClassChange,
    handleSectionChange,
    materials,
    isLoading, isSaving, isUploading,
    showModal, setShowModal,
    editingId, form, fileRef,
    openAddModal, openEditModal,
    handleSubmit, handleDelete,
  };
}
