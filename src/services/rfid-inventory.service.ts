import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta, RfidDevice, RfidDeviceStatus, OneTimeChargeType } from '@/types';

export interface RfidDeviceFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: RfidDeviceStatus;
  school_id?: string;
  [key: string]: unknown;
}

export interface PaginatedRfidDevices {
  items: RfidDevice[];
  pagination: PaginationMeta;
}

export interface CreateRfidDevicePayload {
  device_identifier: string;
  device_model?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  notes?: string;
}

export interface AssignRfidDevicePayload {
  school_id: string;
  billable?: boolean;
  charge_type?: OneTimeChargeType;
  charge_amount?: number;
}

export const RfidInventoryService = {
  async list(filters: RfidDeviceFilters = {}): Promise<PaginatedRfidDevices> {
    const res = await apiGateway.get<RfidDevice[]>(ENDPOINTS.rfidInventory.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async create(payload: CreateRfidDevicePayload): Promise<RfidDevice> {
    const res = await apiGateway.post<RfidDevice>(ENDPOINTS.rfidInventory.list, payload);
    return res.data;
  },

  async assign(id: string, payload: AssignRfidDevicePayload): Promise<RfidDevice> {
    const res = await apiGateway.post<RfidDevice>(ENDPOINTS.rfidInventory.assign(id), payload);
    return res.data;
  },

  async install(id: string): Promise<RfidDevice> {
    const res = await apiGateway.post<RfidDevice>(ENDPOINTS.rfidInventory.install(id));
    return res.data;
  },

  async returnDevice(id: string): Promise<RfidDevice> {
    const res = await apiGateway.post<RfidDevice>(ENDPOINTS.rfidInventory.return(id));
    return res.data;
  },
};
