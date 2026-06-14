export type PaymentsTab = 'student' | 'monthly' | 'create' | 'structure' | 'receipt' | 'discount' | 'extra';

export const FEE_PAYMENTS_TABS: { value: PaymentsTab; label: string }[] = [
  { value: 'student',   label: 'Student Payment' },
  { value: 'monthly',   label: 'Monthly Payment' },
  { value: 'create',    label: 'Create Bill' },
  { value: 'structure', label: 'Structure View' },
  { value: 'receipt',   label: 'Demand Receipt' },
  { value: 'discount',  label: 'Bulk Discount' },
  { value: 'extra',     label: 'Bulk Extra' },
];

export const FEE_BILL_STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'primary'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  PENDING: 'default',
  OVERDUE: 'danger',
  WAIVED: 'primary',
};

const ACADEMIC_MONTHS = [
  { l: 'Apr', n: 4 }, { l: 'May', n: 5 }, { l: 'Jun', n: 6 },
  { l: 'Jul', n: 7 }, { l: 'Aug', n: 8 }, { l: 'Sep', n: 9 },
  { l: 'Oct', n: 10 }, { l: 'Nov', n: 11 }, { l: 'Dec', n: 12 },
  { l: 'Jan', n: 1 }, { l: 'Feb', n: 2 }, { l: 'Mar', n: 3 },
];

const MONTH_NUM_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

export function buildMonthYearOpts(
  academicYearId: string,
  academicYears: { id: string; start_date?: string | null; name?: string; year_name?: string }[],
) {
  const ayObj = academicYears.find(y => y.id === academicYearId);
  const startYr = ayObj?.start_date
    ? new Date(ayObj.start_date).getFullYear()
    : parseInt((ayObj?.name ?? ayObj?.year_name ?? '').split('-')[0]) || new Date().getFullYear();
  return ACADEMIC_MONTHS.map(m => {
    const year = m.n >= 4 ? startYr : startYr + 1;
    return { label: `${m.l}-${year}`, value: `${year}-${String(m.n).padStart(2, '0')}` };
  });
}

export function monthValueToLabel(val: string) {
  const [year, num] = val.split('-');
  return num ? `${MONTH_NUM_LABELS[num] ?? num}-${year}` : val;
}

export function billBalanceDue(bill: {
  total_amount: string;
  paid_amount: string;
  discount_amount: string;
}) {
  return (
    parseFloat(bill.total_amount) -
    parseFloat(bill.paid_amount) -
    parseFloat(bill.discount_amount)
  );
}
