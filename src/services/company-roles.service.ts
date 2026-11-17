import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export interface CompanyRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  member_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface PlatformPermissionCatalog {
  modules: Array<{ module: string; permissions: Array<{ slug: string; label: string }> }>;
  built_in_roles: Array<{ role: string; permissions: string[] }>;
}

export interface CompanyRolePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export const CompanyRolesService = {
  async list(): Promise<CompanyRole[]> {
    const res = await apiGateway.get<CompanyRole[]>(ENDPOINTS.companyRoles.list);
    return res.data;
  },

  async catalog(): Promise<PlatformPermissionCatalog> {
    const res = await apiGateway.get<PlatformPermissionCatalog>(ENDPOINTS.companyRoles.permissions);
    return res.data;
  },

  async create(payload: CompanyRolePayload): Promise<CompanyRole> {
    const res = await apiGateway.post<CompanyRole>(ENDPOINTS.companyRoles.list, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CompanyRolePayload>): Promise<CompanyRole> {
    const res = await apiGateway.patch<CompanyRole>(ENDPOINTS.companyRoles.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.companyRoles.byId(id));
  },
};
