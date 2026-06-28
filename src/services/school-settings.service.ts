import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  SchoolSettings,
  SchoolTiming,
  ClassTimingOverride,
  UpdateSchoolSettingsPayload,
  CreateSchoolTimingPayload,
  UpdateSchoolTimingPayload,
  SetClassTimingPayload,
} from '@/types/school-settings.types';

export const SchoolSettingsService = {
  async getSettings(): Promise<SchoolSettings> {
    const res = await apiGateway.get<SchoolSettings>(ENDPOINTS.schoolSettings.settings);
    return res.data;
  },

  async updateSettings(payload: UpdateSchoolSettingsPayload): Promise<SchoolSettings> {
    const res = await apiGateway.put<SchoolSettings>(ENDPOINTS.schoolSettings.settings, payload);
    return res.data;
  },

  async getTimings(): Promise<SchoolTiming[]> {
    const res = await apiGateway.get<SchoolTiming[]>(ENDPOINTS.schoolSettings.timings);
    return res.data;
  },

  async createTiming(payload: CreateSchoolTimingPayload): Promise<SchoolTiming> {
    const res = await apiGateway.post<SchoolTiming>(ENDPOINTS.schoolSettings.timings, payload);
    return res.data;
  },

  async updateTiming(id: string, payload: UpdateSchoolTimingPayload): Promise<SchoolTiming> {
    const res = await apiGateway.put<SchoolTiming>(ENDPOINTS.schoolSettings.timingById(id), payload);
    return res.data;
  },

  async deleteTiming(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.schoolSettings.timingById(id));
  },

  async getClassOverrides(): Promise<ClassTimingOverride[]> {
    const res = await apiGateway.get<ClassTimingOverride[]>(ENDPOINTS.schoolSettings.classTimings);
    return res.data;
  },

  async setClassTiming(classId: string, payload: SetClassTimingPayload): Promise<ClassTimingOverride> {
    const res = await apiGateway.put<ClassTimingOverride>(
      ENDPOINTS.schoolSettings.classTimingByClass(classId),
      payload,
    );
    return res.data;
  },
};
