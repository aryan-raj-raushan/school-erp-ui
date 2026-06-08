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

export interface PendingAttachment {
  id: string;
  file: File;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  s3Key?: string;
  file_type: string;
  file_size: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

const schema = z.object({
  class_id: z.string().min(1, 'Class is required'),
  class_detail_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional(),
  is_enabled: z.boolean(),
});

export type CreateSyllabusFormValues = z.infer<typeof schema>;

export function useCreateSyllabus() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateSyllabusFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { is_enabled: true, content: '' },
  });

  const watchedClassId = form.watch('class_id');

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const clsRes = await ClassesService.list({ limit: 100 });
      setClasses(clsRes.items);
    } catch { toast.error('Failed to load form data'); }
    finally { setIsLoadingData(false); }
  }, []);

  const fetchClassDetails = useCallback(async (classId: string) => {
    if (!classId) { setClassDetails([]); return; }
    try {
      const res = await ClassDetailsService.list({ class_id: classId, limit: 100 });
      setClassDetails(res.items);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetchClassDetails(watchedClassId ?? '');
    form.setValue('class_detail_id', '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedClassId]);

  function toggleIsEnabled() { form.setValue('is_enabled', !form.getValues('is_enabled')); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only jpg, png, pdf allowed`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: max 2MB allowed`);
        continue;
      }
      const id = `${Date.now()}-${Math.random()}`;
      const pending: PendingAttachment = {
        id,
        file,
        status: 'uploading',
        file_type: ALLOWED_EXT_MAP[file.type] ?? 'file',
        file_size: `${(file.size / 1024).toFixed(1)}KB`,
      };
      setAttachments((prev) => [...prev, pending]);
      try {
        const result = await UploadsService.uploadDocument(file);
        setAttachments((prev) =>
          prev.map((a) => a.id === id ? { ...a, status: 'done', url: result.url, s3Key: result.s3Key } : a),
        );
      } catch {
        setAttachments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'error' } : a));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function createSyllabus(values: CreateSyllabusFormValues) {
    const uploading = attachments.some((a) => a.status === 'uploading');
    if (uploading) { toast.error('Wait for files to finish uploading'); return; }
    try {
      await SyllabusService.create({
        class_id: values.class_id,
        class_detail_id: values.class_detail_id || undefined,
        title: values.title,
        content: values.content || undefined,
        is_enabled: values.is_enabled,
        attachments: attachments
          .filter((a) => a.status === 'done' && a.url)
          .map((a) => ({
            file_name: a.file.name,
            file_url: a.url!,
            file_type: a.file_type,
            file_size: a.file_size,
          })),
      });
      toast.success('Syllabus created');
      router.push(ROUTES.syllabus);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create syllabus');
    }
  }

  function handleBack() { router.push(ROUTES.syllabus); }

  return {
    form, classes, classDetails, isLoadingData,
    attachments, fileInputRef,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(createSyllabus),
    handleFileChange, removeAttachment,
    toggleIsEnabled, handleBack,
  };
}
