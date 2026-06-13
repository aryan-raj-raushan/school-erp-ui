import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

export interface Role {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface RoleFilters {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface CreateRolePayload {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateRolePayload extends Partial<Omit<CreateRolePayload, 'slug'>> {}

export const RolesService = {
  async list(filters: RoleFilters = {}): Promise<{ items: Role[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Role[]>(ENDPOINTS.roles.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Role> {
    const res = await apiGateway.get<Role>(ENDPOINTS.roles.byId(id));
    return res.data;
  },

  async create(payload: CreateRolePayload): Promise<Role> {
    const res = await apiGateway.post<Role>(ENDPOINTS.roles.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateRolePayload): Promise<Role> {
    const res = await apiGateway.patch<Role>(ENDPOINTS.roles.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.roles.byId(id));
  },

  async assignPermissions(id: string, permissionIds: string[]): Promise<{ assigned: number }> {
    const res = await apiGateway.post<{ assigned: number }>(ENDPOINTS.roles.permissions(id), {
      permission_ids: permissionIds,
    });
    return res.data;
  },

  async getRolePermissions(id: string): Promise<string[]> {
    const res = await apiGateway.get<string[]>(ENDPOINTS.roles.permissions(id));
    return res.data;
  },
};
