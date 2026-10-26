import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

async function fetchBackup(url: string): Promise<Blob> {
  const res = await apiGateway.axiosInstance.get(url, { responseType: 'blob' });
  return res.data;
}

export const BackupService = {
  downloadOwn: () => fetchBackup(ENDPOINTS.backup.own),
  downloadForSchool: (schoolId: string) => fetchBackup(ENDPOINTS.backup.school(schoolId)),
};
