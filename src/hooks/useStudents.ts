'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StudentsService, type CreateStudentPayload, type CreateParentPayload } from '@/services/students.service';
import type { Student, Parent, PaginationMeta, StudentStatus } from '@/types';

const studentSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().optional(),
  admission_number: z.string().min(1, 'Admission number required'),
  academic_year_id: z.string().min(1, 'Academic year required'),
  class_id: z.string().min(1, 'Class required'),
  section_id: z.string().optional(),
  roll_number: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  date_of_birth: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone_number: z.string().optional(),
  dial_code: z.string().optional(),
  nationality: z.string().optional(),
  admission_date: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED', 'DROPPED']).optional(),
});

const parentSchema = z.object({
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'GRANDPARENT', 'SIBLING', 'OTHER']),
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().optional(),
  dial_code: z.string().min(1, 'Dial code required'),
  phone_number: z.string().min(1, 'Phone required'),
  email: z.string().email().optional().or(z.literal('')),
  occupation: z.string().optional(),
  is_primary: z.boolean().optional(),
  can_pickup: z.boolean().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
export type ParentFormValues = z.infer<typeof parentSchema>;

interface StudentFilters {
  academic_year_id?: string;
  class_id?: string;
  section_id?: string;
  search?: string;
  status?: StudentStatus;
  page?: number;
}

export function useStudents(initialFilters: StudentFilters = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      dial_code: '+91',
      status: 'ACTIVE',
      nationality: 'Indian',
      ...initialFilters,
    },
  });

  const fetchStudents = useCallback(async (overrideFilters?: StudentFilters) => {
    setIsLoading(true);
    try {
      const result = await StudentsService.list(overrideFilters ?? filters);
      setStudents(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function createStudent(values: StudentFormValues) {
    const payload: CreateStudentPayload = {
      first_name: values.first_name,
      admission_number: values.admission_number,
      academic_year_id: values.academic_year_id,
      class_id: values.class_id,
      ...(values.last_name && { last_name: values.last_name }),
      ...(values.section_id && { section_id: values.section_id }),
      ...(values.roll_number && { roll_number: values.roll_number }),
      ...(values.gender && { gender: values.gender }),
      ...(values.date_of_birth && { date_of_birth: values.date_of_birth }),
      ...(values.email && { email: values.email }),
      ...(values.phone_number && { phone_number: values.phone_number, dial_code: values.dial_code ?? '+91' }),
      ...(values.nationality && { nationality: values.nationality }),
      ...(values.admission_date && { admission_date: values.admission_date }),
      status: values.status ?? 'ACTIVE',
    };
    const student = await StudentsService.create(payload);
    toast.success(`${student.first_name} added`);
    await fetchStudents();
    setShowModal(false);
    form.reset();
  }

  function updateFilters(next: Partial<StudentFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return {
    students, pagination, filters, isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset(); },
    form,
    handleSubmit: form.handleSubmit(createStudent),
    isSubmitting: form.formState.isSubmitting,
    updateFilters,
    refetch: fetchStudents,
  };
}

export function useStudentDetail(studentId: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);

  const parentForm = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: { dial_code: '+91', is_primary: false, can_pickup: false, relation: 'FATHER' },
  });

  const fetchStudent = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, p] = await Promise.all([
        StudentsService.getById(studentId),
        StudentsService.getParents(studentId),
      ]);
      setStudent(s);
      setParents(p);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load student');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  async function addParent(values: ParentFormValues) {
    const payload: CreateParentPayload = {
      relation: values.relation,
      first_name: values.first_name,
      dial_code: values.dial_code,
      phone_number: values.phone_number,
      ...(values.last_name && { last_name: values.last_name }),
      ...(values.email && { email: values.email }),
      ...(values.occupation && { occupation: values.occupation }),
      is_primary: values.is_primary ?? false,
      can_pickup: values.can_pickup ?? false,
    };
    const parent = await StudentsService.addParent(studentId, payload);
    toast.success(`${parent.first_name} added`);
    setParents((prev) => [...prev, parent]);
    setShowParentModal(false);
    parentForm.reset();
  }

  async function removeParent(parentId: string) {
    try {
      await StudentsService.removeParent(studentId, parentId);
      toast.success('Parent removed');
      setParents((prev) => prev.filter((p) => p.id !== parentId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove parent');
    }
  }

  useEffect(() => { fetchStudent(); }, [fetchStudent]);

  return {
    student, parents, isLoading,
    showParentModal,
    openParentModal: () => setShowParentModal(true),
    closeParentModal: () => { setShowParentModal(false); parentForm.reset(); },
    parentForm,
    handleParentSubmit: parentForm.handleSubmit(addParent),
    isParentSubmitting: parentForm.formState.isSubmitting,
    removeParent,
    refetch: fetchStudent,
  };
}
