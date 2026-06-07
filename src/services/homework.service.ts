import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Homework, HomeworkAttachment, HomeworkSubmission, SubmissionStatus } from '@/types';

export interface AttachmentPayload {
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: string;
}

export interface CreateHomeworkPayload {
  academic_year_id: string;
  timetable_session_id?: string;
  class_id: string;
  class_detail_id?: string;
  subject_id?: string;
  title: string;
  description?: string;
  homework_date?: string;
  due_date: string;
  status?: string;
  send_notification?: boolean;
  student_upload_allowed?: boolean;
  attachments?: AttachmentPayload[];
}

export interface HomeworkFilters {
  class_id?: string;
  class_detail_id?: string;
  subject_id?: string;
  academic_year_id?: string;
  timetable_session_id?: string;
}

export interface SubmissionEntry {
  student_id: string;
  status: SubmissionStatus;
  remarks?: string;
}

export interface HomeworkWithAttachments {
  homework: Homework;
  attachments: HomeworkAttachment[];
}

export const HomeworkService = {
  async list(filters: HomeworkFilters = {}): Promise<Homework[]> {
    const res = await apiGateway.get<Homework[]>(ENDPOINTS.homework.list, { params: filters });
    return res.data;
  },

  async getById(id: string): Promise<HomeworkWithAttachments> {
    const res = await apiGateway.get<HomeworkWithAttachments>(ENDPOINTS.homework.byId(id));
    return res.data;
  },

  async create(payload: CreateHomeworkPayload): Promise<HomeworkWithAttachments> {
    const res = await apiGateway.post<HomeworkWithAttachments>(ENDPOINTS.homework.list, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CreateHomeworkPayload>): Promise<HomeworkWithAttachments> {
    const res = await apiGateway.put<HomeworkWithAttachments>(ENDPOINTS.homework.byId(id), payload);
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
};
