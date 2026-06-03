import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Homework, HomeworkSubmission, SubmissionStatus } from '@/types';

export interface CreateHomeworkPayload {
  academic_year_id: string;
  class_section_id: string;
  subject_id: string;
  title: string;
  description?: string;
  due_date: string;
  attachment_url?: string;
}

export interface HomeworkFilters {
  class_section_id?: string;
  subject_id?: string;
  academic_year_id?: string;
}

export interface SubmissionEntry {
  student_id: string;
  status: SubmissionStatus;
  remarks?: string;
}

export const HomeworkService = {
  async list(filters: HomeworkFilters = {}): Promise<Homework[]> {
    const res = await apiGateway.get<Homework[]>(ENDPOINTS.homework.list, { params: filters });
    return res.data;
  },

  async getById(id: string): Promise<Homework> {
    const res = await apiGateway.get<Homework>(ENDPOINTS.homework.byId(id));
    return res.data;
  },

  async create(payload: CreateHomeworkPayload): Promise<Homework> {
    const res = await apiGateway.post<Homework>(ENDPOINTS.homework.list, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CreateHomeworkPayload>): Promise<Homework> {
    const res = await apiGateway.put<Homework>(ENDPOINTS.homework.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.homework.byId(id));
  },

  async getSubmissions(hwId: string): Promise<HomeworkSubmission[]> {
    const res = await apiGateway.get<HomeworkSubmission[]>(ENDPOINTS.homework.submissions(hwId));
    return res.data;
  },

  async bulkMarkSubmissions(hwId: string, submissions: SubmissionEntry[]): Promise<HomeworkSubmission[]> {
    const res = await apiGateway.post<HomeworkSubmission[]>(ENDPOINTS.homework.submissions(hwId), { submissions });
    return res.data;
  },

  async getStudentSubmission(hwId: string, studentId: string): Promise<HomeworkSubmission> {
    const res = await apiGateway.get<HomeworkSubmission>(ENDPOINTS.homework.studentSubmission(hwId, studentId));
    return res.data;
  },

  async updateStudentSubmission(hwId: string, studentId: string, payload: Partial<SubmissionEntry> & { submission_url?: string }): Promise<HomeworkSubmission> {
    const res = await apiGateway.put<HomeworkSubmission>(ENDPOINTS.homework.studentSubmission(hwId, studentId), payload);
    return res.data;
  },

  async parentList(class_section_id?: string): Promise<Homework[]> {
    const res = await apiGateway.get<Homework[]>(ENDPOINTS.homework.parentList, {
      params: class_section_id ? { class_section_id } : {},
    });
    return res.data;
  },
};
