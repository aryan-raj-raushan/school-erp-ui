import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export type GroupedPermissions = Record<
  string,
  { id: string; name: string; display_name: string; action: string }[]
>;

export const PermissionsService = {
  async listGrouped(): Promise<GroupedPermissions> {
    const res = await apiGateway.get<GroupedPermissions>(ENDPOINTS.permissions.list);
    return res.data;
  },
};
