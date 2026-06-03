'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FeeMasterTypesService, FeesService, type CreateFeePayload } from '@/services/fees.service';
import { ClassesService, SectionsService } from '@/services/classes.service';
import { StudentsService } from '@/services/students.service';
import { useAcademicYears } from './useAcademicYears';
import type { FeeMasterType, FeeReceipt, Student, Class, Section, PaymentMode, PaginationMeta } from '@/types';

// ─── useFeeMasterTypes ────────────────────────────────────────────────────────

const feeTypeSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
});
export type FeeTypeFormValues = z.infer<typeof feeTypeSchema>;

export function useFeeMasterTypes() {
  const [feeTypes, setFeeTypes] = useState<FeeMasterType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const form = useForm<FeeTypeFormValues>({ resolver: zodResolver(feeTypeSchema) });

  const fetchTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      setFeeTypes(await FeeMasterTypesService.list());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load fee types');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  function openAdd() { setEditingId(null); form.reset(); setShowModal(true); }
  function openEdit(ft: FeeMasterType) { setEditingId(ft.id); form.reset({ name: ft.name, description: ft.description ?? '' }); setShowModal(true); }

  async function handleSubmit(values: FeeTypeFormValues) {
    setIsSaving(true);
    try {
      if (editingId) {
        await FeeMasterTypesService.update(editingId, values.name, values.description);
        toast.success('Fee type updated');
      } else {
        await FeeMasterTypesService.create(values.name, values.description);
        toast.success('Fee type created');
      }
      setShowModal(false);
      await fetchTypes();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this fee type?')) return;
    try {
      await FeeMasterTypesService.remove(id);
      toast.success('Deleted');
      await fetchTypes();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return { feeTypes, isLoading, isSaving, showModal, setShowModal, editingId, form, openAdd, openEdit, handleSubmit, handleDelete };
}

// ─── useFeeGenerate ───────────────────────────────────────────────────────────

const feeItemSchema = z.object({
  fee_type_id: z.string().min(1, 'Select fee type'),
  fee_type_name: z.string().min(1),
  amount: z.string().min(1, 'Amount required'),
});

const generateFeeSchema = z.object({
  discount_amount: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  fee_items: z.array(feeItemSchema).min(1, 'Add at least one fee item'),
});

export type GenerateFeeFormValues = z.infer<typeof generateFeeSchema>;

const paymentSchema = z.object({
  amount: z.string().min(1, 'Amount required'),
  payment_mode: z.string().min(1, 'Mode required'),
  transaction_id: z.string().optional(),
  notes: z.string().optional(),
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export function useFeeGenerate() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [feeTypes, setFeeTypes] = useState<FeeMasterType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingReceiptId, setPayingReceiptId] = useState<string | null>(null);

  const form = useForm<GenerateFeeFormValues>({
    resolver: zodResolver(generateFeeSchema),
    defaultValues: { fee_items: [{ fee_type_id: '', fee_type_name: '', amount: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'fee_items' });
  const paymentForm = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema) });

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) setSelectedAcademicYearId(currentYear.id);
  }, [currentYear, selectedAcademicYearId]);

  const fetchClasses = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const [classRes, feeTypeRes] = await Promise.all([
        ClassesService.list({ academic_year_id: selectedAcademicYearId }),
        FeeMasterTypesService.list(),
      ]);
      setClasses(classRes.items);
      setFeeTypes(feeTypeRes);
    } catch { /* ignore */ }
  }, [selectedAcademicYearId]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  async function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedSectionId('');
    setStudents([]);
    setReceipts([]);
    setSections([]);
    if (!classId) return;
    try {
      const res = await SectionsService.list({ class_id: classId });
      setSections(res.items);
    } catch { /* ignore */ }
  }

  const fetchSectionData = useCallback(async () => {
    if (!selectedSectionId || !selectedAcademicYearId) return;
    setIsLoading(true);
    try {
      const [studsRes, feesRes] = await Promise.all([
        StudentsService.list({ section_id: selectedSectionId, limit: 100 }),
        FeesService.list(1, 100, undefined),
      ]);
      setStudents(studsRes.items);
      setReceipts(feesRes.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSectionId, selectedAcademicYearId]);

  useEffect(() => { fetchSectionData(); }, [fetchSectionData]);

  function openGenerateModal(studentId?: string) {
    setSelectedStudentId(studentId ?? '');
    form.reset({ fee_items: [{ fee_type_id: '', fee_type_name: '', amount: '' }] });
    setShowModal(true);
  }

  function setFeeTypeName(index: number, typeId: string) {
    const ft = feeTypes.find((t) => t.id === typeId);
    if (ft) form.setValue(`fee_items.${index}.fee_type_name`, ft.name);
  }

  async function handleGenerate(values: GenerateFeeFormValues) {
    if (!selectedStudentId || !selectedAcademicYearId) { toast.error('Select student first'); return; }
    setIsSaving(true);
    try {
      const payload: CreateFeePayload = {
        student_id: selectedStudentId,
        academic_year_id: selectedAcademicYearId,
        fee_items: values.fee_items.map((item) => ({
          fee_type_id: item.fee_type_id,
          fee_type_name: item.fee_type_name,
          amount: Number(item.amount),
        })),
        discount_amount: values.discount_amount ? Number(values.discount_amount) : undefined,
        due_date: values.due_date || undefined,
        notes: values.notes || undefined,
      };
      await FeesService.createSingle(payload);
      toast.success('Fee generated');
      setShowModal(false);
      await fetchSectionData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate fee');
    } finally {
      setIsSaving(false);
    }
  }

  function openPaymentModal(receiptId: string) {
    setPayingReceiptId(receiptId);
    paymentForm.reset({ amount: '', payment_mode: 'CASH', transaction_id: '', notes: '' });
    setShowPaymentModal(true);
  }

  async function handlePayment(values: PaymentFormValues) {
    if (!payingReceiptId) return;
    setIsSaving(true);
    try {
      await FeesService.recordManualPayment(payingReceiptId, {
        amount: Number(values.amount),
        payment_mode: values.payment_mode as PaymentMode,
        transaction_id: values.transaction_id || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      await fetchSectionData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years, selectedAcademicYearId, setSelectedAcademicYearId,
    classes, sections, feeTypes, students, receipts,
    selectedClassId, selectedSectionId, selectedStudentId, setSelectedStudentId,
    handleClassChange, setSelectedSectionId,
    isLoading, isSaving,
    showModal, setShowModal,
    showPaymentModal, setShowPaymentModal,
    form, fields, append, remove,
    paymentForm,
    openGenerateModal, setFeeTypeName,
    handleGenerate, openPaymentModal, handlePayment,
  };
}

// ─── useFeeReceipts ───────────────────────────────────────────────────────────

export function useFeeReceipts() {
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingReceiptId, setPayingReceiptId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const paymentForm = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema) });

  const fetchReceipts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await FeesService.list(page, 20, studentIdFilter || undefined);
      setReceipts(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load receipts');
    } finally {
      setIsLoading(false);
    }
  }, [page, studentIdFilter]);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  function openPaymentModal(receiptId: string) {
    setPayingReceiptId(receiptId);
    paymentForm.reset({ amount: '', payment_mode: 'CASH', transaction_id: '', notes: '' });
    setShowPaymentModal(true);
  }

  async function handlePayment(values: PaymentFormValues) {
    if (!payingReceiptId) return;
    setIsSaving(true);
    try {
      await FeesService.recordManualPayment(payingReceiptId, {
        amount: Number(values.amount),
        payment_mode: values.payment_mode as PaymentMode,
        transaction_id: values.transaction_id || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      await fetchReceipts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    receipts, pagination, studentIdFilter, setStudentIdFilter,
    page, setPage, isLoading, isSaving,
    showPaymentModal, setShowPaymentModal,
    paymentForm, openPaymentModal, handlePayment,
  };
}
