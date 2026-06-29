import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { School } from '@/types';

export interface UpdateSchoolProfilePayload {
  name?: string;
  code?: string;
  contact_number?: string;
  dial_code?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logo_url?: string;
  board_type?: string;
  marking_system?: string;
  lat?: string;
  lng?: string;
  timezone?: string;
  udise_code?: string;
  affiliation_number?: string;
  established_year?: number;
  principal_name?: string;
  principal_email?: string;
  principal_phone?: string;
}

export const SchoolProfileService = {
  async get(): Promise<School> {
    const res = await apiGateway.get<School>(ENDPOINTS.schools.profile);
    return res.data;
  },

  async update(payload: UpdateSchoolProfilePayload): Promise<School> {
    const res = await apiGateway.patch<School>(ENDPOINTS.schools.profile, payload);
    return res.data;
  },
};
