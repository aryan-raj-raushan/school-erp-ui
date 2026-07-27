'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  feeBillService, monthlyDuesService, feeBulkService, demandReceiptService,
  feeClassStructureService, feePlanService, feeTypeService,
  type FeeBill, type FeeBillPayment, type StudentMonthlyDue, type DemandReceiptStudent,
  type FeeClassStructureItem, type FeePlan, type FeeType,
  type CreateFeeBillPayload, type BulkCreateFeeBillPayload, type GenerateStudentBillsPayload,
  type CreateFeePaymentPayload, type BulkDiscountPayload, type BulkExtraPayload,
  type GenerateDemandReceiptParams, type FilterMonthlyDuesParams,
  PAYMENT_MODES,
} from '@/services/fees.service';
import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import { StudentsService } from '@/services/students.service';
import type { Student, Parent } from '@/types';
import { type PaymentsTab } from '@/constants/fee-payments.constants';

interface FinanceAccount {
  id: string;
  name: string;
  account_type: string;
  balance: string;
}

export function useFeesPayments() {
  // ─── Tab ────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<PaymentsTab>('student');

  // ─── Student tab ────────────────────────────────────────────────────────────
  const [studentFilter, setStudentFilter] = useState({ academic_year_id: '', class_id: '' });
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [payingBill, setPayingBill] = useState<FeeBill | null>(null);
  const [payForm, setPayForm] = useState<CreateFeePaymentPayload>({
    amount: 0, payment_mode: 'CASH', payment_date: new Date().toISOString().split('T')[0],
  });
  const [addFeeModal, setAddFeeModal] = useState(false);
  const [addFeeForm, setAddFeeForm] = useState({ fee_type_id: '', bill_month: '', amount: '' });

  // ─── Monthly tab ────────────────────────────────────────────────────────────
  const [monthlyFilter, setMonthlyFilter] = useState({ academic_year_id: '', class_id: '', month: '' });
  const [payingDue, setPayingDue] = useState<StudentMonthlyDue | null>(null);

  // ─── Create tab ─────────────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    student_id: '', academic_year_id: '', fee_type_id: '',
    total_amount: '', bill_month: '', due_date: '', fee_plan_id: '',
  });
  const [createClassId, setCreateClassId] = useState('');

  // ─── Structure view tab ──────────────────────────────────────────────────────
  const [structFilter, setStructFilter] = useState({ academic_year_id: '', fee_plan_id: '', class_id: '' });

  // ─── Demand receipt tab ──────────────────────────────────────────────────────
  const [receiptFilter, setReceiptFilter] = useState({ academic_year_id: '', class_id: '', month_from: '', month_to: '' });

  // ─── Bulk ops ────────────────────────────────────────────────────────────────
  const [discountForm, setDiscountForm] = useState({ academic_year_id: '', class_id: '', fee_type_id: '', discount_amount: '', reason: '' });
  const [extraForm, setExtraForm] = useState({ academic_year_id: '', class_id: '', fee_type_id: '', amount: '', bill_month: '', notes: '' });
  const [confirmDiscount, setConfirmDiscount] = useState(false);
  const [confirmExtra, setConfirmExtra] = useState(false);

  // ─── Student payment — class-based lookup ────────────────────────────────────
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);

  // ─── Create-bill tab student lookup ──────────────────────────────────────────
  const [createStudents, setCreateStudents] = useState<Student[]>([]);
  const [loadingCreateStudents, setLoadingCreateStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentParents, setStudentParents] = useState<Parent[]>([]);
  const [studentStructure, setStudentStructure] = useState<FeeClassStructureItem[]>([]);
  const [loadingStudentStructure, setLoadingStudentStructure] = useState(false);
  const [generatingBills, setGeneratingBills] = useState(false);

  // ─── Student payment ─────────────────────────────────────────────────────────
  const [studentBills, setStudentBills] = useState<FeeBill[]>([]);
  const [billPaymentsMap, setBillPaymentsMap] = useState<Record<string, FeeBillPayment[]>>({});
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [loadingPaymentsFor, setLoadingPaymentsFor] = useState<string | null>(null);
  const [billPayments, setBillPayments] = useState<FeeBillPayment[]>([]);
  const [loadingStudentBills, setLoadingStudentBills] = useState(false);

  // ─── Finance accounts ────────────────────────────────────────────────────────
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // ─── Monthly payment ─────────────────────────────────────────────────────────
  const [monthlyDues, setMonthlyDues] = useState<StudentMonthlyDue[]>([]);
  const [loadingMonthlyDues, setLoadingMonthlyDues] = useState(false);

  // ─── Structure view ──────────────────────────────────────────────────────────
  const [structureView, setStructureView] = useState<FeeClassStructureItem[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [allFeeTypes, setAllFeeTypes] = useState<FeeType[]>([]);
  const [loadingStructureView, setLoadingStructureView] = useState(false);

  // ─── Demand receipt ──────────────────────────────────────────────────────────
  const [demandReceipts, setDemandReceipts] = useState<DemandReceiptStudent[]>([]);
  const [loadingDemandReceipt, setLoadingDemandReceipt] = useState(false);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const regularPlanId = feePlans.find(p => p.plan_type === 'Regular')?.id ?? feePlans[0]?.id ?? '';
  const classFeeTypes = allFeeTypes.filter(t => t.fee_category === 'Class');

  // ─── Fetch functions ─────────────────────────────────────────────────────────
  const fetchCreateClassStudents = useCallback(async (academicYearId: string, classId: string) => {
    if (!academicYearId || !classId) return;
    setCreateStudents([]);
    setLoadingCreateStudents(true);
    try {
      const res = await StudentsService.list({ academic_year_id: academicYearId, class_id: classId, limit: 200 });
      setCreateStudents(res.items);
    } catch { /* ignore */ }
    finally { setLoadingCreateStudents(false); }
  }, []);

  const fetchClassStudents = useCallback(async (academicYearId: string, classId: string) => {
    if (!academicYearId || !classId) return;
    setClassStudents([]);
    setSelectedStudent(null);
    setStudentBills([]);
    setStudentStructure([]);
    setStudentParents([]);
    setLoadingClassStudents(true);
    try {
      const res = await StudentsService.list({ academic_year_id: academicYearId, class_id: classId, limit: 200 });
      setClassStudents(res.items);
    } catch { toast.error('Failed to load students'); }
    finally { setLoadingClassStudents(false); }
  }, []);

  const fetchStudentData = useCallback(async (
    student: Student,
    academicYearId: string,
    feePlanId: string,
    classId: string,
  ) => {
    setSelectedStudent(student);
    setStudentBills([]);
    setStudentStructure([]);
    setStudentParents([]);
    setLoadingStudentBills(true);
    setLoadingStudentStructure(true);

    const [billsRes, parentsRes, structRes] = await Promise.allSettled([
      feeBillService.studentBills(student.id, academicYearId),
      StudentsService.getParents(student.id),
      feePlanId && classId
        ? feeClassStructureService.get({ academic_year_id: academicYearId, fee_plan_id: feePlanId, class_id: classId })
        : Promise.resolve(null),
    ]);

    if (billsRes.status === 'fulfilled') {
      setStudentBills((billsRes.value as any).data ?? billsRes.value);
    } else { toast.error('Failed to load student bills'); }

    if (parentsRes.status === 'fulfilled') {
      setStudentParents((parentsRes.value as any).data ?? parentsRes.value);
    }

    if (structRes.status === 'fulfilled' && structRes.value) {
      const data = (structRes.value as any).data ?? structRes.value;
      setStudentStructure((data ?? []).filter((s: any) => s.is_enabled === true));
    }

    setLoadingStudentBills(false);
    setLoadingStudentStructure(false);
  }, []);

  const clearStudentSelection = useCallback(() => {
    setSelectedStudent(null);
    setStudentBills([]);
    setStudentStructure([]);
    setStudentParents([]);
    setBillPaymentsMap({});
    setExpandedBillId(null);
    setSelectedStudentId('');
  }, []);

  const generateStudentBills = useCallback(async (payload: GenerateStudentBillsPayload, onSuccess?: () => void) => {
    setGeneratingBills(true);
    try {
      const res = await feeBillService.generateForStudent(payload);
      const data = (res as any).data ?? res;
      toast.success(`${data.created} bills generated, ${data.skipped} skipped`);
      onSuccess?.();
    } catch { toast.error('Failed to generate bills'); }
    finally { setGeneratingBills(false); }
  }, []);

  const toggleBillPayments = useCallback(async (billId: string) => {
    if (expandedBillId === billId) { setExpandedBillId(null); return; }
    setExpandedBillId(billId);
    if (billPaymentsMap[billId]) return;
    setLoadingPaymentsFor(billId);
    try {
      const res = await feeBillService.payments(billId);
      const data = (res as any).data ?? res;
      setBillPaymentsMap(prev => ({ ...prev, [billId]: data }));
    } catch { toast.error('Failed to load payment history'); }
    finally { setLoadingPaymentsFor(null); }
  }, [expandedBillId, billPaymentsMap]);

  const deleteBillPayment = useCallback(async (paymentId: string, billId: string, onSuccess?: () => void) => {
    try {
      await feeBillService.deletePayment(paymentId);
      setBillPaymentsMap(prev => ({
        ...prev,
        [billId]: (prev[billId] ?? []).filter(p => p.id !== paymentId),
      }));
      toast.success('Payment deleted');
      onSuccess?.();
    } catch { toast.error('Failed to delete payment'); }
  }, []);

  const fetchFinanceAccounts = useCallback(async () => {
    if (financeAccounts.length > 0) return;
    setLoadingAccounts(true);
    try {
      const res = await apiGateway.get<{ data: FinanceAccount[] }>(ENDPOINTS.financeAccounts.list);
      setFinanceAccounts((res as any).data ?? res);
    } catch { /* non-critical */ }
    finally { setLoadingAccounts(false); }
  }, [financeAccounts.length]);

  const fetchStudentBills = useCallback(async (studentId: string, academicYearId: string) => {
    setLoadingStudentBills(true);
    try {
      const res = await feeBillService.studentBills(studentId, academicYearId);
      setStudentBills((res as any).data ?? res);
    } catch { toast.error('Failed to load student bills'); }
    finally { setLoadingStudentBills(false); }
  }, []);

  const fetchBillPayments = useCallback(async (billId: string) => {
    try {
      const res = await feeBillService.payments(billId);
      setBillPayments((res as any).data ?? res);
    } catch { toast.error('Failed to load payment history'); }
  }, []);

  const fetchFinanceAccountsMemo = useCallback(async () => {
    fetchFinanceAccounts();
  }, [fetchFinanceAccounts]);

  const payBill = async (billId: string, payload: CreateFeePaymentPayload, onSuccess?: () => void) => {
    try {
      await feeBillService.pay(billId, payload);
      toast.success('Payment recorded successfully');
      onSuccess?.();
    } catch { toast.error('Failed to record payment'); }
  };

  const createManualBill = async (payload: CreateFeeBillPayload) => {
    try {
      await feeBillService.create(payload);
      toast.success('Fee bill created successfully');
    } catch { toast.error('Failed to create fee bill'); }
  };

  const generateClassBills = async (payload: BulkCreateFeeBillPayload) => {
    try {
      const res = await feeBillService.generateClass(payload);
      const created = (res as any).data?.created ?? 0;
      toast.success(`${created} bills generated successfully`);
    } catch { toast.error('Failed to generate class bills'); }
  };

  const fetchMonthlyDues = useCallback(async (params: FilterMonthlyDuesParams) => {
    if (!params.academic_year_id || !params.class_id || !params.month) return;
    setLoadingMonthlyDues(true);
    try {
      const res = await monthlyDuesService.get(params);
      setMonthlyDues((res as any).data ?? res);
    } catch { toast.error('Failed to load monthly dues'); }
    finally { setLoadingMonthlyDues(false); }
  }, []);

  const fetchStructureView = useCallback(async (params: { academic_year_id: string; fee_plan_id: string; class_id: string }) => {
    if (!params.academic_year_id || !params.fee_plan_id || !params.class_id) return;
    setLoadingStructureView(true);
    try {
      const res = await feeClassStructureService.get(params);
      setStructureView((res as any).data ?? res);
    } catch { toast.error('Failed to load structure view'); }
    finally { setLoadingStructureView(false); }
  }, []);

  const fetchFeePlans = useCallback(async () => {
    try {
      const res = await feePlanService.list();
      setFeePlans((res as any).data ?? res);
    } catch { toast.error('Failed to load fee plans'); }
  }, []);

  const fetchAllFeeTypes = useCallback(async () => {
    try {
      const res = await feeTypeService.list({ limit: 100 });
      setAllFeeTypes((res as any).data ?? res);
    } catch { toast.error('Failed to load fee types'); }
  }, []);

  const fetchDemandReceipt = useCallback(async (params: GenerateDemandReceiptParams) => {
    if (!params.academic_year_id || !params.class_id) return;
    setLoadingDemandReceipt(true);
    try {
      const res = await demandReceiptService.get(params);
      setDemandReceipts((res as any).data ?? res);
    } catch { toast.error('Failed to load demand receipt'); }
    finally { setLoadingDemandReceipt(false); }
  }, []);

  const applyBulkDiscount = async (payload: BulkDiscountPayload) => {
    try {
      const res = await feeBulkService.discount(payload);
      const applied = (res as any).data?.applied ?? 0;
      toast.success(`Discount applied to ${applied} bills`);
    } catch { toast.error('Failed to apply bulk discount'); }
  };

  const applyBulkExtra = async (payload: BulkExtraPayload) => {
    try {
      const res = await feeBulkService.extra(payload);
      const created = (res as any).data?.created ?? 0;
      toast.success(`${created} extra bills created`);
    } catch { toast.error('Failed to apply bulk extra payment'); }
  };

  // Init fetch on mount
  useEffect(() => {
    fetchFeePlans();
    fetchAllFeeTypes();
    fetchFinanceAccounts();
  }, []);

  // ─── Modal / selection handlers ──────────────────────────────────────────────
  const openPayBillModal = (bill: FeeBill, due: number) => {
    setPayingBill(bill);
    setPayForm({ amount: due, payment_mode: 'CASH', payment_date: new Date().toISOString().split('T')[0] });
  };

  const openPayDueModal = (due: StudentMonthlyDue) => {
    setPayingDue(due);
    setPayForm({ amount: parseFloat(due.due_amount), payment_mode: 'CASH', payment_date: new Date().toISOString().split('T')[0] });
  };

  const closePayModal = () => {
    setPayingBill(null);
    setPayingDue(null);
  };

  const openAddFeeModal = () => {
    setAddFeeModal(true);
    setAddFeeForm({ fee_type_id: '', bill_month: '', amount: '' });
  };

  // ─── Complex selection handlers ──────────────────────────────────────────────
  const handleSessionChange = (sessionId: string) => {
    setStudentFilter(f => ({ ...f, academic_year_id: sessionId, class_id: '' }));
    clearStudentSelection();
  };

  const handleClassChange = (classId: string) => {
    setStudentFilter(f => ({ ...f, class_id: classId }));
    clearStudentSelection();
    if (classId && studentFilter.academic_year_id) {
      fetchClassStudents(studentFilter.academic_year_id, classId);
    }
  };

  const handleStudentChange = (studentId: string, academicYearId: string, planId: string, classId: string) => {
    setSelectedStudentId(studentId);
    if (!studentId) { clearStudentSelection(); return; }
    const s = classStudents.find(st => st.id === studentId);
    if (s) fetchStudentData(s, academicYearId, planId, classId);
  };

  const handleCreateSessionChange = (sessionId: string) => {
    setCreateForm(f => ({ ...f, academic_year_id: sessionId, student_id: '', bill_month: '' }));
    setCreateClassId('');
  };

  const handleCreateClassChange = (classId: string, academicYearId: string) => {
    setCreateClassId(classId);
    setCreateForm(f => ({ ...f, student_id: '' }));
    if (classId && academicYearId) fetchCreateClassStudents(academicYearId, classId);
  };

  // ─── Submit handlers ─────────────────────────────────────────────────────────
  const handlePayBill = async () => {
    if (!payingBill || !selectedStudent) return;
    await payBill(payingBill.id, payForm, () => {
      setPayingBill(null);
      fetchStudentData(selectedStudent, studentFilter.academic_year_id, regularPlanId, studentFilter.class_id);
    });
  };

  const handleAddFee = async () => {
    if (!selectedStudent || !addFeeForm.fee_type_id || !addFeeForm.amount) return;
    await createManualBill({
      student_id: selectedStudent.id,
      academic_year_id: studentFilter.academic_year_id,
      fee_type_id: addFeeForm.fee_type_id,
      total_amount: parseFloat(addFeeForm.amount) || 0,
      bill_month: addFeeForm.bill_month || undefined,
      fee_plan_id: regularPlanId || undefined,
    });
    setAddFeeModal(false);
    setAddFeeForm({ fee_type_id: '', bill_month: '', amount: '' });
    fetchStudentData(selectedStudent, studentFilter.academic_year_id, regularPlanId, studentFilter.class_id);
  };

  const handleMonthlyPay = async () => {
    if (!payingDue || !payingDue.bill_ids.length) return;
    await payBill(payingDue.bill_ids[0], payForm, () => {
      setPayingDue(null);
      fetchMonthlyDues(monthlyFilter);
    });
  };

  const handleCreateBill = async () => {
    await createManualBill({
      student_id: createForm.student_id,
      academic_year_id: createForm.academic_year_id,
      fee_type_id: createForm.fee_type_id,
      total_amount: parseFloat(createForm.total_amount) || 0,
      bill_month: createForm.bill_month || undefined,
      due_date: createForm.due_date || undefined,
      fee_plan_id: createForm.fee_plan_id || undefined,
    });
    setCreateForm({ student_id: '', academic_year_id: '', fee_type_id: '', total_amount: '', bill_month: '', due_date: '', fee_plan_id: '' });
    setCreateClassId('');
  };

  const handleBulkDiscount = async () => {
    await applyBulkDiscount({
      academic_year_id: discountForm.academic_year_id,
      class_id: discountForm.class_id || undefined,
      fee_type_id: discountForm.fee_type_id,
      discount_amount: parseFloat(discountForm.discount_amount) || 0,
      reason: discountForm.reason || undefined,
    });
    setDiscountForm({ academic_year_id: '', class_id: '', fee_type_id: '', discount_amount: '', reason: '' });
    setConfirmDiscount(false);
  };

  const handleBulkExtra = async () => {
    await applyBulkExtra({
      academic_year_id: extraForm.academic_year_id,
      class_id: extraForm.class_id || undefined,
      fee_type_id: extraForm.fee_type_id,
      amount: parseFloat(extraForm.amount) || 0,
      bill_month: extraForm.bill_month || undefined,
      notes: extraForm.notes || undefined,
    });
    setExtraForm({ academic_year_id: '', class_id: '', fee_type_id: '', amount: '', bill_month: '', notes: '' });
    setConfirmExtra(false);
  };

  return {
    // Tab
    tab, setTab,
    // Student tab state
    studentFilter, setStudentFilter,
    selectedStudentId,
    payingBill, setPayingBill,
    payForm, setPayForm,
    addFeeModal, setAddFeeModal,
    addFeeForm, setAddFeeForm,
    // Monthly tab state
    monthlyFilter, setMonthlyFilter,
    payingDue, setPayingDue,
    // Create tab state
    createForm, setCreateForm,
    createClassId, setCreateClassId,
    // Structure view tab state
    structFilter, setStructFilter,
    // Demand receipt tab state
    receiptFilter, setReceiptFilter,
    // Bulk ops state
    discountForm, setDiscountForm,
    extraForm, setExtraForm,
    confirmDiscount, setConfirmDiscount,
    confirmExtra, setConfirmExtra,
    // Modal handlers
    openPayBillModal, openPayDueModal, closePayModal, openAddFeeModal,
    // Selection handlers
    handleSessionChange, handleClassChange, handleStudentChange,
    handleCreateSessionChange, handleCreateClassChange,
    // Submit handlers
    handlePayBill, handleAddFee, handleMonthlyPay, handleCreateBill,
    handleBulkDiscount, handleBulkExtra,
    // Student payment — class-based
    classStudents, loadingClassStudents, fetchClassStudents,
    selectedStudent, studentParents,
    studentStructure, loadingStudentStructure,
    fetchStudentData, clearStudentSelection,
    // Generate bills
    generatingBills, generateStudentBills,
    // Bill payment history
    billPaymentsMap, expandedBillId, loadingPaymentsFor,
    toggleBillPayments, deleteBillPayment,
    // Student payment — direct
    studentBills, loadingStudentBills, fetchStudentBills,
    billPayments, fetchBillPayments,
    payBill,
    // Finance accounts
    financeAccounts, loadingAccounts, fetchFinanceAccounts,
    // Create bill tab
    createStudents, loadingCreateStudents, fetchCreateClassStudents,
    // Derived
    regularPlanId, classFeeTypes,
    // Create payment
    createManualBill, generateClassBills,
    // Monthly dues
    monthlyDues, loadingMonthlyDues, fetchMonthlyDues,
    // Structure view
    structureView, loadingStructureView, fetchStructureView,
    feePlans, fetchFeePlans,
    allFeeTypes, fetchAllFeeTypes,
    // Demand receipt
    demandReceipts, loadingDemandReceipt, fetchDemandReceipt,
    // Bulk ops
    applyBulkDiscount, applyBulkExtra,
    // Constants
    PAYMENT_MODES,
  };
}
