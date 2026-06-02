import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  Exam,
  ExamPolicy,
  ExamTimetableEntry,
  ExamStudent,
  ExamRoom,
  ExamSeat,
  AdmitCard,
  ExamMark,
  ExamMarkEntry,
  TeacherRemark,
} from '@/types';

// ─── Exams ────────────────────────────────────────────────────────────────────

export interface CreateExamPayload {
  name: string;
  academic_year_id: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export const ExamsService = {
  async list(academic_year_id?: string): Promise<Exam[]> {
    const res = await apiGateway.get<Exam[]>(ENDPOINTS.exams.list, {
      params: academic_year_id ? { academic_year_id } : {},
    });
    return res.data;
  },

  async getById(id: string): Promise<Exam> {
    const res = await apiGateway.get<Exam>(ENDPOINTS.exams.byId(id));
    return res.data;
  },

  async create(payload: CreateExamPayload): Promise<Exam> {
    const res = await apiGateway.post<Exam>(ENDPOINTS.exams.list, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CreateExamPayload>): Promise<Exam> {
    const res = await apiGateway.put<Exam>(ENDPOINTS.exams.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.exams.byId(id));
  },
};

// ─── Exam Policy ──────────────────────────────────────────────────────────────

export interface CreateExamPolicyPayload {
  exam_id: string;
  name: string;
  passing_marks?: number;
  total_marks?: number;
  marking_system?: 'MARKS' | 'GRADES' | 'PERCENTAGE';
  grace_marks?: number;
}

export const ExamPolicyService = {
  async list(exam_id?: string): Promise<ExamPolicy[]> {
    const res = await apiGateway.get<ExamPolicy[]>(ENDPOINTS.exams.policy, {
      params: exam_id ? { exam_id } : {},
    });
    return res.data;
  },

  async create(payload: CreateExamPolicyPayload): Promise<ExamPolicy> {
    const res = await apiGateway.post<ExamPolicy>(ENDPOINTS.exams.policy, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CreateExamPolicyPayload>): Promise<ExamPolicy> {
    const res = await apiGateway.put<ExamPolicy>(ENDPOINTS.exams.policyById(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.exams.policyById(id));
  },
};

// ─── Exam Timetable ───────────────────────────────────────────────────────────

export interface CreateTimetablePayload {
  exam_id: string;
  class_section_id: string;
  subject_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  room_number?: string;
}

export const ExamTimetableService = {
  async list(exam_id: string): Promise<ExamTimetableEntry[]> {
    const res = await apiGateway.get<ExamTimetableEntry[]>(ENDPOINTS.exams.timetable, {
      params: { exam_id },
    });
    return res.data;
  },

  async create(payload: CreateTimetablePayload): Promise<ExamTimetableEntry> {
    const res = await apiGateway.post<ExamTimetableEntry>(ENDPOINTS.exams.timetable, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CreateTimetablePayload>): Promise<ExamTimetableEntry> {
    const res = await apiGateway.put<ExamTimetableEntry>(ENDPOINTS.exams.timetableById(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.exams.timetableById(id));
  },
};

// ─── Exam Students ────────────────────────────────────────────────────────────

export const ExamStudentsService = {
  async list(exam_id: string): Promise<ExamStudent[]> {
    const res = await apiGateway.get<ExamStudent[]>(ENDPOINTS.exams.students, {
      params: { exam_id },
    });
    return res.data;
  },

  async register(exam_id: string, student_ids: string[]): Promise<ExamStudent[]> {
    const res = await apiGateway.post<ExamStudent[]>(ENDPOINTS.exams.registerStudents, {
      exam_id,
      student_ids,
    });
    return res.data;
  },

  async updateEligibility(examId: string, studentId: string, is_eligible: boolean): Promise<ExamStudent> {
    const res = await apiGateway.put<ExamStudent>(
      ENDPOINTS.exams.studentEligibility(examId, studentId),
      { is_eligible },
    );
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.exams.studentById(id));
  },
};

// ─── Exam Rooms ───────────────────────────────────────────────────────────────

export const ExamRoomsService = {
  async list(exam_id: string): Promise<ExamRoom[]> {
    const res = await apiGateway.get<ExamRoom[]>(ENDPOINTS.exams.rooms, { params: { exam_id } });
    return res.data;
  },

  async create(payload: { exam_id: string; room_name: string; capacity: number }): Promise<ExamRoom> {
    const res = await apiGateway.post<ExamRoom>(ENDPOINTS.exams.rooms, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<{ room_name: string; capacity: number }>): Promise<ExamRoom> {
    const res = await apiGateway.put<ExamRoom>(ENDPOINTS.exams.roomById(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.exams.roomById(id));
  },
};

// ─── Exam Seating ─────────────────────────────────────────────────────────────

export const ExamSeatingService = {
  async list(exam_id: string, date?: string): Promise<ExamSeat[]> {
    const res = await apiGateway.get<ExamSeat[]>(ENDPOINTS.exams.seating, {
      params: { exam_id, ...(date ? { date } : {}) },
    });
    return res.data;
  },

  async autoGenerate(exam_id: string, date: string): Promise<ExamSeat[]> {
    const res = await apiGateway.post<ExamSeat[]>(ENDPOINTS.exams.seatingAutoGenerate, { exam_id, date });
    return res.data;
  },

  async assign(payload: {
    exam_id: string;
    exam_room_id: string;
    student_id: string;
    seat_number: string;
    date: string;
  }): Promise<ExamSeat> {
    const res = await apiGateway.post<ExamSeat>(ENDPOINTS.exams.seating, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.exams.seatingById(id));
  },
};

// ─── Admit Cards ──────────────────────────────────────────────────────────────

export const AdmitCardsService = {
  async generateClass(exam_id: string, student_ids: string[]): Promise<AdmitCard[]> {
    const res = await apiGateway.post<AdmitCard[]>(ENDPOINTS.exams.admitCardGenerateClass, {
      exam_id,
      student_ids,
    });
    return res.data;
  },

  async getClass(exam_id: string, class_section_id: string): Promise<AdmitCard[]> {
    const res = await apiGateway.get<AdmitCard[]>(ENDPOINTS.exams.admitCardClass, {
      params: { exam_id, class_section_id },
    });
    return res.data;
  },

  async getStudent(exam_id: string, student_id: string): Promise<AdmitCard> {
    const res = await apiGateway.get<AdmitCard>(ENDPOINTS.exams.admitCardStudent, {
      params: { exam_id, student_id },
    });
    return res.data;
  },

  async preview(exam_id: string, student_id: string): Promise<string> {
    const res = await apiGateway.get<{ html: string }>(ENDPOINTS.exams.admitCardPreview, {
      params: { exam_id, student_id },
    });
    return res.data.html;
  },
};

// ─── Exam Marks ───────────────────────────────────────────────────────────────

export const ExamMarksService = {
  async list(exam_id: string, class_section_id?: string, subject_id?: string): Promise<ExamMark[]> {
    const res = await apiGateway.get<ExamMark[]>(ENDPOINTS.exams.marks, {
      params: { exam_id, ...(class_section_id ? { class_section_id } : {}), ...(subject_id ? { subject_id } : {}) },
    });
    return res.data;
  },

  async submitBulk(payload: {
    exam_id: string;
    subject_id: string;
    class_section_id: string;
    total_marks: number;
    entries: ExamMarkEntry[];
  }): Promise<ExamMark[]> {
    const res = await apiGateway.post<ExamMark[]>(ENDPOINTS.exams.marksBulk, payload);
    return res.data;
  },
};

// ─── Teacher Remarks ──────────────────────────────────────────────────────────

export const TeacherRemarksService = {
  async list(exam_id?: string, student_id?: string): Promise<TeacherRemark[]> {
    const res = await apiGateway.get<TeacherRemark[]>(ENDPOINTS.exams.remarks, {
      params: { ...(exam_id ? { exam_id } : {}), ...(student_id ? { student_id } : {}) },
    });
    return res.data;
  },

  async create(payload: { exam_id: string; student_id: string; remark: string }): Promise<TeacherRemark> {
    const res = await apiGateway.post<TeacherRemark>(ENDPOINTS.exams.remarks, payload);
    return res.data;
  },
};

// ─── Mark Sheet ───────────────────────────────────────────────────────────────

export const MarkSheetService = {
  async getClass(exam_id: string, class_section_id: string): Promise<unknown> {
    const res = await apiGateway.get(ENDPOINTS.exams.markSheetClass, {
      params: { exam_id, class_section_id },
    });
    return res.data;
  },

  async getStudent(studentId: string, exam_id: string): Promise<unknown> {
    const res = await apiGateway.get(ENDPOINTS.exams.markSheetStudent(studentId), {
      params: { exam_id },
    });
    return res.data;
  },
};
