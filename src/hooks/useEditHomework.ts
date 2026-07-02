'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { HomeworkService } from '@/services/homework.service';
import { UploadsService } from '@/services/uploads.service';
import { ClassesService } from '@/services/classes.service';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES } from '@/constants';
import type { Class, HomeworkAttachment } from '@/types';

export interface PendingAttachment {
  id: string;
  file: File;
  status: 'uploading' | 'done' | 'error';
  url?: string;
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
  academic_year_id: z.string().min(1, 'Academic year is required'),
  class_id: z.string().min(1, 'Class is required'),
  subject_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  homework_date: z.string().optional(),
  due_date: z.string().min(1, 'Submission date is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']).default('ACTIVE'),
  send_notification: z.boolean().default(false),
  student_upload_allowed: z.boolean().default(false),
  description: z.string().optional(),
});

export type EditHomeworkFormValues = z.infer<typeof schema>;

export function useEditHomework(homeworkId: string) {
  const router = useRouter();
  const { years } = useAcademicYears();

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [savedAttachments, setSavedAttachments] = useState<HomeworkAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<PendingAttachment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditHomeworkFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      status: 'ACTIVE',
      send_notification: false,
      student_upload_allowed: false,
    },
  });

  const watchedClassId = form.watch('class_id');

  const fetchInitialData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [clsRes, subRes, hwRes] = await Promise.all([
        ClassesService.list({ limit: 100 }),
        SubjectsService.list({ limit: 100 }),
        HomeworkService.getById(homeworkId),
      ]);
      setClasses(clsRes.items);
      setSubjects(subRes.items);
      setSavedAttachments(hwRes.attachments);

      const hw = hwRes.homework;

      form.reset({
        academic_year_id: hw.academic_year_id,
        class_id: hw.class_id ?? '',
        subject_id: hw.subject_id ?? '',
        title: hw.title,
        homework_date: hw.homework_date ?? '',
        due_date: hw.due_date,
        status: (hw.status as 'DRAFT' | 'ACTIVE' | 'CLOSED') ?? 'ACTIVE',
        send_notification: hw.send_notification,
        student_upload_allowed: hw.student_upload_allowed,
        description: hw.description ?? '',
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load homework');
    } finally {
      setIsLoadingData(false);
    }
  }, [homeworkId, form]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const prevClassId = useRef<string>('');
  useEffect(() => {
    if (!isLoadingData && watchedClassId && watchedClassId !== prevClassId.current) {
      prevClassId.current = watchedClassId;
      if (prevClassId.current !== '') {
        form.setValue('subject_id', '');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedClassId, isLoadingData]);

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
      setNewAttachments((prev) => [...prev, pending]);
      try {
        const result = await UploadsService.uploadDocument(file, {
          reference_id: homeworkId,
          reference_type: 'homework',
          document_type: 'attachment',
        });
        setNewAttachments((prev) =>
          prev.map((a) => a.id === id ? { ...a, status: 'done', url: result.url } : a),
        );
      } catch {
        setNewAttachments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'error' } : a));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }

  function removeSavedAttachment(id: string) {
    setSavedAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function removeNewAttachment(id: string) {
    setNewAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function updateHomework(values: EditHomeworkFormValues) {
    if (newAttachments.some((a) => a.status === 'uploading')) {
      toast.error('Wait for files to finish uploading');
      return;
    }
    try {
      const mergedAttachments = [
        ...savedAttachments.map((a) => ({
          file_name: a.file_name,
          file_url: a.file_url,
          file_type: a.file_type,
          file_size: a.file_size ?? undefined,
        })),
        ...newAttachments
          .filter((a) => a.status === 'done' && a.url)
          .map((a) => ({
            file_name: a.file.name,
            file_url: a.url!,
            file_type: a.file_type,
            file_size: a.file_size,
          })),
      ];

      await HomeworkService.update(homeworkId, {
        academic_year_id: values.academic_year_id,
        class_id: values.class_id,
        subject_id: values.subject_id || undefined,
        title: values.title,
        description: values.description || undefined,
        homework_date: values.homework_date || undefined,
        due_date: values.due_date,
        status: values.status,
        send_notification: values.send_notification,
        student_upload_allowed: values.student_upload_allowed,
        attachments: mergedAttachments,
      });
      toast.success('Homework updated');
      router.push(ROUTES.homework);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update homework');
    }
  }

  function handleBack() { router.push(ROUTES.homework); }

  return {
    form, years, classes, subjects,
    isLoadingData, savedAttachments, newAttachments, fileInputRef,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(updateHomework),
    handleFileChange, removeSavedAttachment, removeNewAttachment,
    handleBack,
  };
}
