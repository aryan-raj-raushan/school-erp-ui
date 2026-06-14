'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  feeTypeService, feePlanService, feeClassStructureService,
  transportRouteService, feeLateRuleService,
  type FeeType, type FeePlan, type FeeClassStructureItem,
  type TransportRoute, type TransportRouteFeeItem, type FeeLateRule,
  type CreateFeeTypePayload, type UpdateFeeTypePayload, type FeeFrequency,
  type UpsertClassStructurePayload, type FilterClassStructureParams,
  type CreateTransportRoutePayload, type UpsertRouteFeePayload,
  type CreateFeeLateRulePayload,
  FEE_CATEGORIES, FEE_FREQUENCIES, MONTHS,
} from '@/services/fees.service';
import { AcademicYearsService } from '@/services/academic-years.service';
import { ClassesService } from '@/services/classes.service';
import { FinanceService } from '@/services/finance.service';
import {
  SetupTab, BuilderItem, FEE_SETUP_TABS,
  EMPTY_FEE_TYPE, EMPTY_ROUTE, EMPTY_LATE_RULE,
} from '@/constants/fee-setup.constants';

export function useFeesSetup() {
  // Lookup data
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [incomeHeads, setIncomeHeads] = useState<{ id: string; name: string }[]>([]);

  // Tab
  const [tab, setTab] = useState<SetupTab>('class-types');

  // Modal visibility
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showLateRuleModal, setShowLateRuleModal] = useState(false);

  // Forms
  const [feeTypeForm, setFeeTypeForm] = useState<CreateFeeTypePayload & { id?: string }>(EMPTY_FEE_TYPE);
  const [routeForm, setRouteForm] = useState<CreateTransportRoutePayload & { id?: string }>(EMPTY_ROUTE);
  const [lateRuleForm, setLateRuleForm] = useState(EMPTY_LATE_RULE);

  // Builder
  const [builderItems, setBuilderItems] = useState<BuilderItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [structureMode, setStructureMode] = useState<'idle' | 'view' | 'edit'>('idle');

  // Route expansion
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  // Fee Types
  const [classFeeTypes, setClassFeeTypes] = useState<FeeType[]>([]);
  const [transportFeeTypes, setTransportFeeTypes] = useState<FeeType[]>([]);
  const [loadingFeeTypes, setLoadingFeeTypes] = useState(false);

  // Fee Plans
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Class Structure
  const [structureFilter, setStructureFilter] = useState<FilterClassStructureParams>({
    academic_year_id: '', fee_plan_id: '', class_id: '',
  });
  const [classStructure, setClassStructure] = useState<FeeClassStructureItem[]>([]);
  const [loadingStructure, setLoadingStructure] = useState(false);

  // Transport Routes
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeFees, setRouteFees] = useState<TransportRouteFeeItem[]>([]);
  const [routeFeesAcademicYear, setRouteFeesAcademicYear] = useState('');
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Late Rules
  const [lateRules, setLateRules] = useState<FeeLateRule[]>([]);
  const [loadingLateRules, setLoadingLateRules] = useState(false);

  const fetchLookups = useCallback(async () => {
    try {
      const [yrs, cls, heads] = await Promise.all([
        AcademicYearsService.list(),
        ClassesService.list({ limit: 100 }),
        FinanceService.listHeads({ head_type: 'Income', limit: 100 }),
      ]);
      setAcademicYears(yrs.items ?? []);
      setClasses(cls.items ?? []);
      setIncomeHeads(heads.items ?? []);
    } catch {
      toast.error('Failed to load lookup data');
    }
  }, []);

  const fetchClassFeeTypes = useCallback(async () => {
    setLoadingFeeTypes(true);
    try {
      const res = await feeTypeService.list({ fee_category: 'Class', limit: 100 });
      setClassFeeTypes((res as any).data ?? res);
    } catch { toast.error('Failed to load class fee types'); }
    finally { setLoadingFeeTypes(false); }
  }, []);

  const fetchTransportFeeTypes = useCallback(async () => {
    setLoadingFeeTypes(true);
    try {
      const res = await feeTypeService.list({ fee_category: 'Transport', limit: 100 });
      setTransportFeeTypes((res as any).data ?? res);
    } catch { toast.error('Failed to load transport fee types'); }
    finally { setLoadingFeeTypes(false); }
  }, []);

  const fetchFeePlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await feePlanService.list();
      setFeePlans((res as any).data ?? res);
    } catch { toast.error('Failed to load fee plans'); }
    finally { setLoadingPlans(false); }
  }, []);

  const fetchClassStructure = useCallback(async (filter: FilterClassStructureParams) => {
    if (!filter.academic_year_id || !filter.fee_plan_id || !filter.class_id) return;
    setLoadingStructure(true);
    try {
      const res = await feeClassStructureService.get(filter);
      setClassStructure((res as any).data ?? res);
    } catch { toast.error('Failed to load class fee structure'); }
    finally { setLoadingStructure(false); }
  }, []);

  const fetchTransportRoutes = useCallback(async () => {
    setLoadingRoutes(true);
    try {
      const res = await transportRouteService.list();
      setTransportRoutes((res as any).data ?? res);
    } catch { toast.error('Failed to load transport routes'); }
    finally { setLoadingRoutes(false); }
  }, []);

  const fetchRouteFees = useCallback(async (routeId: string, academicYearId: string) => {
    if (!academicYearId) return;
    try {
      const res = await transportRouteService.getFees(routeId, academicYearId);
      setRouteFees((res as any).data ?? res);
    } catch { toast.error('Failed to load route fees'); }
  }, []);

  const fetchLateRules = useCallback(async (academicYearId?: string) => {
    setLoadingLateRules(true);
    try {
      const res = await feeLateRuleService.list(academicYearId);
      setLateRules((res as any).data ?? res);
    } catch { toast.error('Failed to load late rules'); }
    finally { setLoadingLateRules(false); }
  }, []);

  useEffect(() => { fetchLookups(); }, [fetchLookups]);

  // Lazy tab-based fetching
  useEffect(() => {
    if (tab === 'class-types') fetchClassFeeTypes();
    else if (tab === 'transport-types') fetchTransportFeeTypes();
    else if (tab === 'plans') fetchFeePlans();
    else if (tab === 'routes') fetchTransportRoutes();
    else if (tab === 'late-rules') fetchLateRules();
  }, [tab, fetchClassFeeTypes, fetchTransportFeeTypes, fetchFeePlans, fetchTransportRoutes, fetchLateRules]);

  // Sync classStructure → builderItems when structure loads
  useEffect(() => {
    if (classStructure.length === 0) return;
    const enabled = classStructure.filter(s => s.is_enabled === true);
    const items = enabled.map(s => ({
      fee_type_id: s.fee_type_id,
      fee_type_name: s.fee_type_name,
      frequency: s.frequency,
      applicable_months: s.applicable_months,
      amount: s.amount ?? '',
    }));
    setBuilderItems(items);
    setStructureMode(items.length > 0 ? 'view' : 'idle');
  }, [classStructure]);

  // Reset builder when filter changes
  useEffect(() => {
    setBuilderItems([]);
    setStructureMode('idle');
  }, [structureFilter.class_id, structureFilter.fee_plan_id, structureFilter.academic_year_id]);

  // Computed values
  const availableTypes = classStructure.filter(
    s => !builderItems.some(i => i.fee_type_id === s.fee_type_id),
  );
  const hasExistingStructure = classStructure.some(s => s.structure_id !== null);
  const selectedAcademicYearName = (academicYears as any[]).find(y => y.id === structureFilter.academic_year_id)?.name ?? '';
  const selectedPlanName = feePlans.find(p => p.id === structureFilter.fee_plan_id)?.name ?? '';
  const selectedClassName = (classes as any[]).find(c => c.id === structureFilter.class_id)?.name
    ?? (classes as any[]).find(c => c.id === structureFilter.class_id)?.class_name ?? '';
  const builderTotal = builderItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  // Fee type actions
  const createFeeType = async (payload: CreateFeeTypePayload) => {
    try {
      await feeTypeService.create(payload);
      toast.success('Fee type created');
      if (payload.fee_category === 'Transport') fetchTransportFeeTypes();
      else fetchClassFeeTypes();
    } catch { toast.error('Failed to create fee type'); }
  };

  const updateFeeType = async (id: string, payload: UpdateFeeTypePayload) => {
    try {
      await feeTypeService.update(id, payload);
      toast.success('Fee type updated');
      fetchClassFeeTypes();
      fetchTransportFeeTypes();
    } catch { toast.error('Failed to update fee type'); }
  };

  const deleteFeeType = async (id: string) => {
    try {
      await feeTypeService.delete(id);
      toast.success('Fee type deleted');
      fetchClassFeeTypes();
      fetchTransportFeeTypes();
    } catch { toast.error('Failed to delete fee type'); }
  };

  // Fee plan actions
  const toggleFeePlan = async (id: string, is_active: boolean) => {
    try {
      await feePlanService.update(id, { is_active });
      toast.success(is_active ? 'Plan activated' : 'Plan deactivated');
      fetchFeePlans();
    } catch { toast.error('Failed to update fee plan'); }
  };

  // Class structure actions
  const saveClassStructure = async (payload: UpsertClassStructurePayload) => {
    try {
      await feeClassStructureService.upsert(payload);
      toast.success('Class fee structure saved');
      fetchClassStructure(structureFilter);
    } catch { toast.error('Failed to save class fee structure'); }
  };

  const handleLoadStructure = () => {
    setBuilderItems([]);
    setStructureMode('idle');
    fetchClassStructure(structureFilter);
  };

  const handleSaveStructure = async () => {
    const items = [
      ...builderItems.map(i => ({
        fee_type_id: i.fee_type_id,
        amount: parseFloat(i.amount) || 0,
        is_enabled: true,
      })),
      ...classStructure
        .filter(s => !builderItems.some(i => i.fee_type_id === s.fee_type_id))
        .map(s => ({ fee_type_id: s.fee_type_id, amount: 0, is_enabled: false })),
    ];
    await saveClassStructure({ ...structureFilter, items });
    setStructureMode('view');
  };

  const handleDrop = () => {
    setDropZoneActive(false);
    if (!draggingId) return;
    const type = classStructure.find(s => s.fee_type_id === draggingId);
    if (!type || builderItems.some(i => i.fee_type_id === draggingId)) return;
    setBuilderItems(prev => [...prev, {
      fee_type_id: type.fee_type_id,
      fee_type_name: type.fee_type_name,
      frequency: type.frequency,
      applicable_months: type.applicable_months,
      amount: type.amount ?? '',
    }]);
    setDraggingId(null);
  };

  const removeFromBuilder = (id: string) => {
    setBuilderItems(prev => prev.filter(i => i.fee_type_id !== id));
  };

  const updateBuilderAmount = (id: string, amount: string) => {
    setBuilderItems(prev => prev.map(i => i.fee_type_id === id ? { ...i, amount } : i));
  };

  const toggleMonth = (month: string) => {
    const months = feeTypeForm.applicable_months ?? [];
    setFeeTypeForm(f => ({
      ...f,
      applicable_months: months.includes(month) ? months.filter(m => m !== month) : [...months, month],
    }));
  };

  const openAddFeeType = (category: 'Class' | 'Transport') => {
    setFeeTypeForm({ ...EMPTY_FEE_TYPE, fee_category: category });
    setShowFeeTypeModal(true);
  };

  const openEditFeeType = (t: FeeType) => {
    setFeeTypeForm({
      id: t.id,
      name: t.name,
      fee_category: t.fee_category,
      frequency: t.frequency,
      applicable_months: t.applicable_months ?? [],
      income_head_id: t.income_head_id ?? undefined,
    });
    setShowFeeTypeModal(true);
  };

  const handleSaveFeeType = async () => {
    const { id, ...payload } = feeTypeForm;
    if (id) await updateFeeType(id, payload);
    else await createFeeType(payload);
    setShowFeeTypeModal(false);
    setFeeTypeForm(EMPTY_FEE_TYPE);
  };

  // Transport route actions
  const createTransportRoute = async (payload: CreateTransportRoutePayload) => {
    try {
      await transportRouteService.create(payload);
      toast.success('Transport route created');
      fetchTransportRoutes();
    } catch { toast.error('Failed to create transport route'); }
  };

  const deleteTransportRoute = async (id: string) => {
    try {
      await transportRouteService.delete(id);
      toast.success('Transport route deleted');
      fetchTransportRoutes();
    } catch { toast.error('Failed to delete transport route'); }
  };

  const saveRouteFees = async (routeId: string, payload: UpsertRouteFeePayload) => {
    try {
      await transportRouteService.upsertFees(routeId, payload);
      toast.success('Route fees saved');
      fetchRouteFees(routeId, payload.academic_year_id);
    } catch { toast.error('Failed to save route fees'); }
  };

  const openAddRoute = () => {
    setRouteForm(EMPTY_ROUTE);
    setShowRouteModal(true);
  };

  const handleSaveRoute = async () => {
    const { id, ...payload } = routeForm;
    if (!id) await createTransportRoute(payload);
    setShowRouteModal(false);
    setRouteForm(EMPTY_ROUTE);
  };

  const handleRouteExpand = async (routeId: string) => {
    if (expandedRoute === routeId) { setExpandedRoute(null); return; }
    setExpandedRoute(routeId);
    if (routeFeesAcademicYear) await fetchRouteFees(routeId, routeFeesAcademicYear);
  };

  // Late rule actions
  const createLateRule = async (payload: CreateFeeLateRulePayload) => {
    try {
      await feeLateRuleService.create(payload);
      toast.success('Late rule created');
      fetchLateRules();
    } catch { toast.error('Failed to create late rule'); }
  };

  const deleteLateRule = async (id: string) => {
    try {
      await feeLateRuleService.delete(id);
      toast.success('Late rule deleted');
      fetchLateRules();
    } catch { toast.error('Failed to delete late rule'); }
  };

  const handleSaveLateRule = async () => {
    await createLateRule({
      name: lateRuleForm.name,
      academic_year_id: lateRuleForm.academic_year_id,
      applicable_fee_type_ids: [],
      late_fine_fee_type_id: lateRuleForm.late_fine_fee_type_id,
      late_fee_amount: parseFloat(lateRuleForm.late_fee_amount) || 0,
      days_after_due: parseInt(lateRuleForm.days_after_due) || 0,
    });
    setShowLateRuleModal(false);
    setLateRuleForm(EMPTY_LATE_RULE);
  };

  return {
    // Lookups
    academicYears, classes, incomeHeads,
    // Tab
    tab, setTab,
    // Modals
    showFeeTypeModal, setShowFeeTypeModal,
    showRouteModal, setShowRouteModal,
    showLateRuleModal, setShowLateRuleModal,
    // Forms
    feeTypeForm, setFeeTypeForm,
    routeForm, setRouteForm,
    lateRuleForm, setLateRuleForm,
    // Builder
    builderItems, setBuilderItems, draggingId, setDraggingId,
    dropZoneActive, setDropZoneActive, structureMode, setStructureMode,
    expandedRoute,
    // Computed
    availableTypes, hasExistingStructure,
    selectedAcademicYearName, selectedPlanName, selectedClassName, builderTotal,
    // Fee types
    classFeeTypes, transportFeeTypes, loadingFeeTypes,
    fetchClassFeeTypes, fetchTransportFeeTypes,
    openAddFeeType, openEditFeeType, handleSaveFeeType,
    createFeeType, updateFeeType, deleteFeeType,
    toggleMonth,
    // Fee plans
    feePlans, loadingPlans, fetchFeePlans, toggleFeePlan,
    // Class structure
    structureFilter, setStructureFilter,
    classStructure, loadingStructure, fetchClassStructure, saveClassStructure,
    handleLoadStructure, handleSaveStructure,
    handleDrop, removeFromBuilder, updateBuilderAmount,
    // Transport routes
    transportRoutes, loadingRoutes, fetchTransportRoutes,
    selectedRouteId, setSelectedRouteId,
    routeFees, routeFeesAcademicYear, setRouteFeesAcademicYear,
    fetchRouteFees, createTransportRoute, deleteTransportRoute, saveRouteFees,
    openAddRoute, handleSaveRoute, handleRouteExpand,
    // Late rules
    lateRules, loadingLateRules, fetchLateRules, createLateRule, deleteLateRule,
    handleSaveLateRule,
    // Constants
    FEE_CATEGORIES, FEE_FREQUENCIES, MONTHS, FEE_SETUP_TABS,
  };
}
