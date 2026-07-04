'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlatformFilePicker } from './usePlatformFilePicker';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StudyMaterialsService } from '@/services/study-materials.service';
import { UploadsService } from '@/services/uploads.service';
import { ClassesService } from '@/services/classes.service';
import { ClassSubjectTeacherService } from '@/services/class-subject-teacher.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

export interface StudyMaterialSubjectOption {
  id: string;
  name: string;
}

const schema = z.object({
  academic_year_id: z.string().min(1, 'Session is required'),
  class_id: z.string().min(1, 'Class is required'),
  subject_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  content_type: z.enum(['text', 'file', 'youtube']),
  content_text: z.string().optional(),
  youtube_url: z.string().optional(),
});

export type CreateStudyMaterialFormValues = z.infer<typeof schema>;

export function useCreateStudyMaterial() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<StudyMaterialSubjectOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [nativeFile, setNativeFile] = useState<File | null>(null);
  const { isNative, pickDocument } = usePlatformFilePicker();

  const form = useForm<CreateStudyMaterialFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content_type: 'file' },
  });

  const { watch, setValue } = form;
  const watchedAcademicYearId = watch('academic_year_id');
  const watchedClassId = watch('class_id');
  const contentType = watch('content_type');

  // Set default academic year
  useEffect(() => {
    if (currentYear && !watchedAcademicYearId) {
      setValue('academic_year_id', currentYear.id);
    }
  }, [currentYear, watchedAcademicYearId, setValue]);

  // Load classes when academic year changes
  useEffect(() => {
    if (!watchedAcademicYearId) return;
    setIsLoadingData(true);
    ClassesService.list({ academic_year_id: watchedAcademicYearId, limit: 100 })
      .then((clsRes) => setClasses(clsRes.items))
      .catch(() => {})
      .finally(() => setIsLoadingData(false));
  }, [watchedAcademicYearId]);

  // Subjects are scoped to the selected class — only subjects mapped to
  // that class (via Subject-Teacher Map) for the selected academic year.
  useEffect(() => {
    if (!watchedClassId || !watchedAcademicYearId) {
      setSubjects([]);
      return;
    }
    setIsLoadingSubjects(true);
    ClassSubjectTeacherService.list({
      academic_year_id: watchedAcademicYearId,
      class_id: watchedClassId,
    })
      .then((mappings) => {
        const unique = new Map<string, StudyMaterialSubjectOption>();
        mappings.forEach((m) => unique.set(m.subject_id, { id: m.subject_id, name: m.subject_name }));
        setSubjects(Array.from(unique.values()));
      })
      .catch(() => {
        toast.error('Failed to load subjects for this class');
        setSubjects([]);
      })
      .finally(() => setIsLoadingSubjects(false));
  }, [watchedClassId, watchedAcademicYearId]);

  // Reset subject whenever the class changes
  useEffect(() => {
    setValue('subject_id', '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedClassId]);

  async function handleSubmit(values: CreateStudyMaterialFormValues) {
    setIsSubmitting(true);
    try {
      let fileUrl: string | undefined;
      let fileType: string | undefined;

      if (values.content_type === 'file') {
        const file = nativeFile ?? fileRef.current?.files?.[0];
        if (!file) { toast.error('Upload a file'); setIsSubmitting(false); return; }
        setIsUploading(true);
        const result = await UploadsService.uploadDocument(file, {
          reference_id: values.subject_id || values.class_id,
          reference_type: 'study_material',
          document_type: 'file',
        });
        fileUrl = result.url;
        fileType = file.type;
        setIsUploading(false);
      }

      if (values.content_type === 'text' && !values.content_text?.trim()) {
        toast.error('Enter document text'); setIsSubmitting(false); return;
      }
      if (values.content_type === 'youtube' && !values.youtube_url?.trim()) {
        toast.error('Enter a YouTube URL'); setIsSubmitting(false); return;
      }

      await StudyMaterialsService.create({
        academic_year_id: values.academic_year_id,
        class_id: values.class_id,
        subject_id: values.subject_id || undefined,
        title: values.title,
        content_type: values.content_type,
        content_text: values.content_type === 'text' ? values.content_text : undefined,
        file_url: fileUrl,
        file_type: fileType,
        youtube_url: values.content_type === 'youtube' ? values.youtube_url : undefined,
      });

      toast.success('Study document created');
      router.push(ROUTES.materials);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  function handleBack() {
    router.push(ROUTES.materials);
  }

  return {
    form,
    years,
    classes,
    subjects,
    isLoadingData,
    isLoadingSubjects,
    isSubmitting,
    isUploading,
    contentType,
    fileRef,
    nativeFile,
    isNative,
    pickNativeDocument: async () => { const f = await pickDocument(); if (f) setNativeFile(f); },
    handleSubmit: form.handleSubmit(handleSubmit),
    handleBack,
  };
}
