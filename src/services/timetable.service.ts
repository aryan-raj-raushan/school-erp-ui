import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface PeriodTimeDto {
  period_number: number;
  start_time?: string;
  end_time?: string;
  is_break?: boolean;
}

export interface TimetableEntryDto {
  day_of_week: DayOfWeek;
  period_number: number;
  subject_id?: string;
  teacher_id?: string;
}

export interface CreateTimetablePayload {
  academic_year_id?: string;
  class_id?: string;
  name: string;
  max_periods: number;
  period_times?: PeriodTimeDto[];
  entries?: TimetableEntryDto[];
  class_teacher_id?: string;
  is_complete?: boolean;
}

export interface TimetableFilters {
  academic_year_id?: string;
  class_id?: string;
  limit?: number;
  offset?: number;
}

export interface TimetableSummary {
  id: string;
  school_id: string;
  academic_year_id?: string | null;
  class_id?: string | null;
  name: string;
  max_periods: number;
  is_complete: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  class_name?: string | null;
}

export interface TimetableFull extends TimetableSummary {
  period_times: PeriodTimeDto[];
  entries: (TimetableEntryDto & {
    id: string;
    subject_name?: string | null;
    subject_code?: string | null;
    teacher_name?: string | null;
  })[];
  class_teacher_id?: string | null;
  class_teacher_name?: string | null;
}

export interface EmployeeTimetableEntry {
  timetable_id: string;
  timetable_name: string;
  class_name?: string | null;
  day_of_week: DayOfWeek;
  period_number: number;
  subject_name?: string | null;
}

export interface SessionViewEntry {
  timetable_id: string;
  timetable_name: string;
  class_name?: string | null;
  period_number: number;
  subject_name?: string | null;
  teacher_name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}

export interface AutoGenerateTimetablePayload {
  name?: string;
  academic_year_id: string;
  class_id: string;
  school_timing_id: string;
  lunch_after_period?: number;
  lunch_duration_minutes?: number;
}

export interface AutoGenerateConflict {
  day_of_week: DayOfWeek;
  period_number: number;
  subject_name: string;
  teacher_name: string;
}

export interface AutoGenerateResult {
  timetable: TimetableFull;
  conflicts: AutoGenerateConflict[];
}

type TimetableApiEntry = TimetableEntryDto & {
  id: string;
  subject_name?: string | null;
  subject_code?: string | null;
  teacher_name?: string | null;
};

interface TimetableApiResponse {
  timetable: TimetableSummary;
  period_times: PeriodTimeDto[];
  entries: TimetableApiEntry[];
  class_teacher?: { teacher_id: string; teacher_name: string | null } | null;
}

function mapTimetableResponse(res: TimetableApiResponse): TimetableFull {
  const { timetable, period_times, entries, class_teacher } = res;
  return {
    ...timetable,
    period_times: period_times ?? [],
    entries: entries ?? [],
    class_teacher_id: class_teacher?.teacher_id ?? null,
    class_teacher_name: class_teacher?.teacher_name ?? null,
  };
}

export const TimetableService = {
  async list(filters: TimetableFilters = {}): Promise<{ items: TimetableSummary[]; total: number }> {
    const res = await apiGateway.get<TimetableSummary[]>(ENDPOINTS.timetable.list, { params: filters });
    return { items: res.data, total: res.data.length };
  },

  async getById(id: string): Promise<TimetableFull> {
    const res = await apiGateway.get<TimetableApiResponse>(ENDPOINTS.timetable.byId(id));
    return mapTimetableResponse(res.data);
  },

  async create(payload: CreateTimetablePayload): Promise<TimetableFull> {
    const res = await apiGateway.post<TimetableApiResponse>(ENDPOINTS.timetable.list, payload);
    return mapTimetableResponse(res.data);
  },

  async update(id: string, payload: Partial<CreateTimetablePayload>): Promise<TimetableFull> {
    const res = await apiGateway.put<TimetableApiResponse>(ENDPOINTS.timetable.byId(id), payload);
    return mapTimetableResponse(res.data);
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.timetable.byId(id));
  },

  async getEmployeeTimetable(teacherId: string): Promise<EmployeeTimetableEntry[]> {
    const res = await apiGateway.get<EmployeeTimetableEntry[]>(ENDPOINTS.timetable.employeeView(teacherId));
    return res.data;
  },

  async getSessionView(day: DayOfWeek, filters: { academic_year_id?: string; timetable_name?: string } = {}): Promise<SessionViewEntry[]> {
    const res = await apiGateway.get<SessionViewEntry[]>(ENDPOINTS.timetable.sessionView, { params: { day, ...filters } });
    return res.data;
  },

  async autoGenerate(payload: AutoGenerateTimetablePayload): Promise<AutoGenerateResult> {
    const res = await apiGateway.post<{ timetable: TimetableApiResponse; conflicts: AutoGenerateConflict[] }>(
      ENDPOINTS.timetable.autoGenerate,
      payload,
    );
    return { timetable: mapTimetableResponse(res.data.timetable), conflicts: res.data.conflicts };
  },
};
