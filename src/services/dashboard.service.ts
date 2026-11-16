import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export interface AttendanceSummaryRow {
  status: string;
  count: number;
}

export interface AttendanceTrendRow {
  date: string;
  present: number;
  absent: number;
}

export interface ClasswiseStudentRow {
  class_id: string;
  class_name: string;
  count: number;
}

export interface GenderRow {
  gender: string | null;
  count: number;
}

export interface AdmissionStatusRow {
  status: string;
  count: number;
}

export interface HomeworkStatusRow {
  status: string | null;
  count: number;
}

export interface FeeStatusRow {
  status: string;
  total: string;
  paid: string;
  count: number;
}

export interface UpcomingEvent {
  id: string;
  name: string;
  type: string;
  from_date: string;
  to_date: string;
}

export interface UpcomingExam {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface RecentHomework {
  id: string;
  title: string;
  status: string | null;
  due_date: string | null;
}

export interface AdminDashboard {
  date: string;
  currentAcademicYear: { id: string; name: string; is_active: boolean } | null;
  counts: {
    students: number;
    staff: number;
    parents: number;
    classes: number;
    subjects: number;
  };
  attendance: {
    today: AttendanceSummaryRow[];
    rate: number | null;
    present: number;
    absent: number;
    trend: AttendanceTrendRow[];
  };
  fees: {
    totalBilled: number;
    totalCollected: number;
    totalPending: number;
    pendingCount: number;
    byStatus: FeeStatusRow[];
  };
  admissions: { byStatus: AdmissionStatusRow[] };
  students: { byGender: GenderRow[]; byClass: ClasswiseStudentRow[] };
  leave: { pending: { teacher: number; student: number } };
  events: { upcoming: UpcomingEvent[] };
  homework: { byStatus: HomeworkStatusRow[]; recent: RecentHomework[] };
  exams: { upcoming: UpcomingExam[] };
  finance: { totalIncome: number; totalExpenses: number; pendingSalaryCount: number };
}

export interface TeacherDashboard {
  attendanceSummary: AttendanceSummaryRow[];
  recentHomework: RecentHomework[];
  upcomingExams: UpcomingExam[];
  upcomingEvents: UpcomingEvent[];
}

export interface ParentAttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalDays: number;
  attendancePercent: number;
}

export interface ParentDashboard {
  attendance: ParentAttendanceSummary | null;
  recentHomework: RecentHomework[];
  upcomingExams: UpcomingExam[];
  upcomingEvents: UpcomingEvent[];
  pendingFees: { count: number; amount: number };
}

export type SetupStepKey =
  | 'school_profile'
  | 'academic_year'
  | 'classes'
  | 'sections'
  | 'timings'
  | 'staff'
  | 'students'
  | 'parent_logins';

export interface SetupStep {
  key: SetupStepKey;
  done: boolean;
  count: number | null;
}

export interface SetupStatus {
  steps: SetupStep[];
  completed: number;
  total: number;
}

export const DashboardService = {
  async getSetupStatus(): Promise<SetupStatus> {
    const res = await apiGateway.get<SetupStatus>(ENDPOINTS.dashboard.setupStatus);
    return res.data;
  },

  async getAdminDashboard(): Promise<AdminDashboard> {
    const res = await apiGateway.get<AdminDashboard>(ENDPOINTS.dashboard.admin);
    return res.data;
  },

  async getTeacherDashboard(): Promise<TeacherDashboard> {
    const res = await apiGateway.get<TeacherDashboard>(ENDPOINTS.dashboard.teacher);
    return res.data;
  },

  async getParentDashboard(): Promise<ParentDashboard> {
    const res = await apiGateway.get<ParentDashboard>(ENDPOINTS.dashboard.parent);
    return res.data;
  },
};
