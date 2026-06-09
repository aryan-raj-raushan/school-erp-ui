'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StudyMaterialsService, type CreateStudyMaterialPayload } from '@/services/study-materials.service';
import { ClassesService } from '@/services/classes.service';
import { ClassDetailsService } from '@/services/class-details.service';
import { UploadsService } from '@/services/uploads.service';
import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import { useAcademicYears } from './useAcademicYears';
import type { StudyMaterial, Class, Section } from '@/types';

const matSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  content_type: z.enum(['text', 'file', 'youtube']).default('file'),
  content_text: z.string().optional(),
  file_url: z.string().optional(),
  file_type: z.string().optional(),
  youtube_url: z.string().optional(),
});

export type MaterialFormValues = z.infer<typeof matSchema>;

export function useStudyMaterials() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [classDetails, setClassDetails] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassDetailId, setSelectedClassDetailId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(matSchema),
    defaultValues: { content_type: 'file' },
  });

  const contentType = form.watch('content_type');

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
    setSelectedClassDetailId('');
    setSelectedSectionId('');
    setSelectedSubjectId('');
    setClassDetails([]);
    setSections(classId ? allSections.filter((s) => s.class_id === classId) : []);
    setSubjects([]);
    if (!classId) return;
    try {
      const [detailsRes, subjectItems] = await Promise.all([
        ClassDetailsService.list({ class_id: classId, limit: 100 }),
        ClassesService.listSubjects(classId),
      ]);
      setClassDetails(detailsRes.items.map((d) => ({ id: d.id, name: d.name })));
      if (subjectItems.length > 0) {
        setSubjects(subjectItems.map((s) => ({ id: s.id, name: s.name })));
      } else {
        const masterRes = await apiGateway.get<any[]>(ENDPOINTS.masterData.subjects, { params: { limit: 200 } });
        setSubjects((masterRes.data ?? []).map((s: any) => ({ id: s.id, name: s.subject_name })));
      }
    } catch { /* ignore */ }
  }

  async function handleSectionChange(sectionId: string) {
    setSelectedSectionId(sectionId);
    setSelectedSubjectId('');
    setSubjects([]);
    if (!sectionId) return;
    try {
      const items = await ClassesService.listSubjects(selectedClassId);
      if (items.length > 0) {
        setSubjects(items.map((s) => ({ id: s.id, name: s.name })));
      } else {
        const masterRes = await apiGateway.get<any[]>(ENDPOINTS.masterData.subjects, { params: { limit: 200 } });
        setSubjects((masterRes.data ?? []).map((s: any) => ({ id: s.id, name: s.subject_name })));
      }
    } catch { /* ignore */ }
  }

  const fetchMaterials = useCallback(async () => {
    if (!selectedAcademicYearId || !selectedClassId) return;
    setIsLoading(true);
    try {
      const data = await StudyMaterialsService.list({
        academic_year_id: selectedAcademicYearId,
        class_id: selectedClassId,
        class_detail_id: selectedClassDetailId || undefined,
        subject_id: selectedSubjectId || undefined,
      });
      setMaterials(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYearId, selectedClassId, selectedClassDetailId, selectedSubjectId]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  function openAddModal() {
    setEditingId(null);
    form.reset({ title: '', description: '', content_type: 'file', content_text: '', file_url: '', file_type: '', youtube_url: '' });
    setShowModal(true);
  }

  function openEditModal(mat: StudyMaterial) {
    setEditingId(mat.id);
    form.reset({
      title: mat.title,
      description: mat.description ?? '',
      content_type: mat.content_type ?? 'file',
      content_text: mat.content_text ?? '',
      file_url: mat.file_url ?? '',
      file_type: mat.file_type ?? '',
      youtube_url: mat.youtube_url ?? '',
    });
    setShowModal(true);
  }

  async function handleSubmit(values: MaterialFormValues) {
    if (!selectedAcademicYearId || !selectedClassId) {
      toast.error('Select session and class first');
      return;
    }
    setIsSaving(true);
    try {
      let fileUrl = values.file_url ?? '';
      let fileType = values.file_type ?? '';

      if (values.content_type === 'file') {
        const file = fileRef.current?.files?.[0];
        if (file) {
          setIsUploading(true);
          const result = await UploadsService.uploadDocument(file, {
            reference_id: selectedSubjectId || selectedClassId,
            reference_type: 'study_material',
            document_type: 'file',
          });
          fileUrl = result.url;
          fileType = file.type;
          setIsUploading(false);
        }
        if (!fileUrl) { toast.error('Upload a file or enter a URL'); setIsSaving(false); return; }
      }

      if (values.content_type === 'text' && !values.content_text?.trim()) {
        toast.error('Enter document text'); setIsSaving(false); return;
      }
      if (values.content_type === 'youtube' && !values.youtube_url?.trim()) {
        toast.error('Enter a YouTube URL'); setIsSaving(false); return;
      }

      const payload: CreateStudyMaterialPayload = {
        academic_year_id: selectedAcademicYearId,
        class_id: selectedClassId,
        class_detail_id: selectedClassDetailId || undefined,
        subject_id: selectedSubjectId || undefined,
        title: values.title,
        description: values.description,
        content_type: values.content_type,
        content_text: values.content_type === 'text' ? values.content_text : undefined,
        file_url: values.content_type === 'file' ? fileUrl : undefined,
        file_type: values.content_type === 'file' ? (fileType || undefined) : undefined,
        youtube_url: values.content_type === 'youtube' ? values.youtube_url : undefined,
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
    classes, sections, classDetails, subjects,
    selectedClassId, selectedClassDetailId, selectedSectionId, selectedSubjectId,
    setSelectedClassDetailId,
    setSelectedSubjectId,
    handleClassChange,
    handleSectionChange,
    contentType,
    materials,
    isLoading, isSaving, isUploading,
    showModal, setShowModal,
    editingId, form, fileRef,
    openAddModal, openEditModal,
    handleSubmit, handleDelete,
  };
}
