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
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

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
  class_detail_id: z.string().optional(),
  subject_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  homework_date: z.string().optional(),
  due_date: z.string().min(1, 'Submission date is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']).default('ACTIVE'),
  send_notification: z.boolean().default(false),
  student_upload_allowed: z.boolean().default(false),
  description: z.string().optional(),
});

export type CreateHomeworkFormValues = z.infer<typeof schema>;

export function useCreateHomework() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();

  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateHomeworkFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      status: 'ACTIVE',
      send_notification: false,
      student_upload_allowed: false,
    },
  });

  const watchedClassId = form.watch('class_id');

  useEffect(() => {
    if (currentYear && !form.getValues('academic_year_id')) {
      form.setValue('academic_year_id', currentYear.id);
    }
  }, [currentYear, form]);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const clsRes = await ClassesService.list({ limit: 100 });
      setClasses(clsRes.items);
    } catch { toast.error('Failed to load form data'); }
    finally { setIsLoadingData(false); }
  }, []);

  const fetchClassDetails = useCallback(async (classId: string) => {
    if (!classId) { setClassDetails([]); setSubjects([]); return; }
    try {
      const [cdRes, subRes] = await Promise.all([
        ClassDetailsService.list({ class_id: classId, limit: 100 }),
        SubjectsService.list({ class_id: classId, limit: 100 }),
      ]);
      setClassDetails(cdRes.items);
      setSubjects(subRes.items);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetchClassDetails(watchedClassId ?? '');
    form.setValue('class_detail_id', '');
    form.setValue('subject_id', '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedClassId]);

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
        const result = await UploadsService.uploadDocument(file, {
          reference_id: crypto.randomUUID(),
          reference_type: 'homework',
          document_type: 'attachment',
        });
        setAttachments((prev) =>
          prev.map((a) => a.id === id ? { ...a, status: 'done', url: result.url } : a),
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

  async function createHomework(values: CreateHomeworkFormValues) {
    if (attachments.some((a) => a.status === 'uploading')) {
      toast.error('Wait for files to finish uploading');
      return;
    }
    try {
      await HomeworkService.create({
        academic_year_id: values.academic_year_id,
        class_id: values.class_id,
        class_detail_id: values.class_detail_id || undefined,
        subject_id: values.subject_id || undefined,
        title: values.title,
        description: values.description || undefined,
        homework_date: values.homework_date || undefined,
        due_date: values.due_date,
        status: values.status,
        send_notification: values.send_notification,
        student_upload_allowed: values.student_upload_allowed,
        attachments: attachments
          .filter((a) => a.status === 'done' && a.url)
          .map((a) => ({
            file_name: a.file.name,
            file_url: a.url!,
            file_type: a.file_type,
            file_size: a.file_size,
          })),
      });
      toast.success('Homework created');
      router.push(ROUTES.homework);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create homework');
    }
  }

  function handleBack() { router.push(ROUTES.homework); }

  return {
    form, years, classes, classDetails, subjects,
    isLoadingData, attachments, fileInputRef,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(createHomework),
    handleFileChange, removeAttachment,
    handleBack,
  };
}
