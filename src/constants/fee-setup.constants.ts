import type { CreateFeeTypePayload, CreateTransportRoutePayload } from '@/services/fees.service';

export type SetupTab = 'class-types' | 'transport-types' | 'plans' | 'structure' | 'routes' | 'late-rules';

export const FEE_SETUP_TABS = [
  { value: 'class-types' as const, label: 'Fee Types' },
  { value: 'transport-types' as const, label: 'Transport Fee Types' },
  { value: 'plans' as const, label: 'Fee Plans' },
  { value: 'structure' as const, label: 'Class Fee Structure' },
  { value: 'routes' as const, label: 'Transport Routes' },
  { value: 'late-rules' as const, label: 'Late Payment Rules' },
] satisfies { value: SetupTab; label: string }[];

export type BuilderItem = {
  fee_type_id: string;
  fee_type_name: string;
  frequency: string;
  applicable_months: string[] | null;
  amount: string;
};

export const EMPTY_FEE_TYPE: CreateFeeTypePayload & { id?: string } = {
  name: '', fee_category: 'Class', frequency: 'NA', applicable_months: [], income_head_id: undefined,
};

export const EMPTY_ROUTE: CreateTransportRoutePayload & { id?: string } = { name: '', description: '' };

export const EMPTY_LATE_RULE = {
  name: '', academic_year_id: '', late_fee_amount: '', days_after_due: '', late_fine_fee_type_id: '',
  applicable_fee_type_ids: [] as string[],
};
