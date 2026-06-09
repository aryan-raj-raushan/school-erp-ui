'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SyllabusService } from '@/services/syllabus.service';
import { UploadsService } from '@/services/uploads.service';
import { ClassesService } from '@/services/classes.service';
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';
import type { PendingAttachment } from './useCreateSyllabus';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export interface SavedAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: string | null;
}

const schema = z.object({
  class_id: z.string().min(1, 'Class is required'),
  class_detail_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional(),
  is_enabled: z.boolean(),
});

export type EditSyllabusFormValues = z.infer<typeof schema>;

export function useEditSyllabus(id: string) {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [savedAttachments, setSavedAttachments] = useState<SavedAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditSyllabusFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { is_enabled: true, content: '' },
  });

  const watchedClassId = form.watch('class_id');

  const fetchClassDetails = useCallback(async (classId: string) => {
    if (!classId) { setClassDetails([]); return; }
    try {
      const res = await ClassDetailsService.list({ class_id: classId, limit: 100 });
      setClassDetails(res.items);
    } catch { /* ignore */ }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [syllabus, clsRes] = await Promise.all([
        SyllabusService.getById(id),
        ClassesService.list({ limit: 100 }),
      ]);
      setClasses(clsRes.items);
      if (syllabus.class_id) await fetchClassDetails(syllabus.class_id);
      setSavedAttachments(syllabus.attachments ?? []);
      form.reset({
        class_id: syllabus.class_id,
        class_detail_id: syllabus.class_detail_id ?? '',
        title: syllabus.title,
        content: syllabus.content ?? '',
        is_enabled: syllabus.is_enabled,
      });
    } catch {
      toast.error('Failed to load syllabus');
      router.push(ROUTES.syllabus);
    } finally { setIsLoadingData(false); }
  }, [id, form, router, fetchClassDetails]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (watchedClassId !== undefined) fetchClassDetails(watchedClassId ?? '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedClassId]);

  function toggleIsEnabled() { form.setValue('is_enabled', !form.getValues('is_enabled')); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) { toast.error(`${file.name}: only jpg, png, pdf allowed`); continue; }
      if (file.size > MAX_FILE_SIZE) { toast.error(`${file.name}: max 2MB allowed`); continue; }
      const pendingId = `${Date.now()}-${Math.random()}`;
      const pending: PendingAttachment = {
        id: pendingId, file, status: 'uploading',
        file_type: ALLOWED_EXT_MAP[file.type] ?? 'file',
        file_size: `${(file.size / 1024).toFixed(1)}KB`,
      };
      setNewAttachments((prev) => [...prev, pending]);
      try {
        const result = await UploadsService.uploadDocument(file, {
          reference_id: id,
          reference_type: 'syllabus',
          document_type: 'attachment',
        });
        setNewAttachments((prev) =>
          prev.map((a) => a.id === pendingId ? { ...a, status: 'done', url: result.url, s3Key: result.s3Key } : a),
        );
      } catch {
        setNewAttachments((prev) => prev.map((a) => a.id === pendingId ? { ...a, status: 'error' } : a));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }

  function removeSavedAttachment(attId: string) {
    setSavedAttachments((prev) => prev.filter((a) => a.id !== attId));
  }

  function removeNewAttachment(pendingId: string) {
    setNewAttachments((prev) => prev.filter((a) => a.id !== pendingId));
  }

  async function updateSyllabus(values: EditSyllabusFormValues) {
    const uploading = newAttachments.some((a) => a.status === 'uploading');
    if (uploading) { toast.error('Wait for files to finish uploading'); return; }
    try {
      const allAttachments = [
        ...savedAttachments.map((a) => ({ file_name: a.file_name, file_url: a.file_url, file_type: a.file_type, file_size: a.file_size ?? undefined })),
        ...newAttachments.filter((a) => a.status === 'done' && a.url).map((a) => ({
          file_name: a.file.name, file_url: a.url!, file_type: a.file_type, file_size: a.file_size,
        })),
      ];
      await SyllabusService.update(id, {
        class_id: values.class_id,
        class_detail_id: values.class_detail_id || undefined,
        title: values.title,
        content: values.content || undefined,
        is_enabled: values.is_enabled,
        attachments: allAttachments,
      });
      toast.success('Syllabus updated');
      router.push(ROUTES.syllabus);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update syllabus');
    }
  }

  function handleBack() { router.push(ROUTES.syllabus); }

  return {
    form, classes, classDetails, isLoadingData,
    savedAttachments, newAttachments, fileInputRef,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(updateSyllabus),
    handleFileChange, removeSavedAttachment, removeNewAttachment,
    toggleIsEnabled, handleBack,
  };
}
