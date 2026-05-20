/**
 * services/schools.service.ts
 *
 * Domain-level wrapper for the Schools resource.
 * Demonstrates GET (list + single), POST, PATCH, DELETE usage.
 */

import { apiGateway } from '../api-gateway.instance';
import type { PaginationMeta } from '../types';

// ─── DTOs ──────────────────────────────────────────────────────────────────────

export interface School {
  id: string;
  name: string;
  code?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolFilters {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export interface PaginatedSchools {
  items: School[];
  meta: PaginationMeta;
}

export interface CreateSchoolPayload {
  name: string;
  code?: string;
  address?: string;
}

export interface UpdateSchoolPayload extends Partial<CreateSchoolPayload> {}

// ─── Service ──────────────────────────────────────────────────────────────────

export const SchoolsService = {
  /** GET /schools?page=1&limit=20&search= */
  async list(filters: SchoolFilters = {}): Promise<PaginatedSchools> {
    const res = await apiGateway.get<School[]>('/schools', { params: filters });
    return {
      items: res.data,
      meta: res.meta!,
    };
  },

  /** GET /schools/:id */
  async getById(id: string): Promise<School> {
    const res = await apiGateway.get<School>(`/schools/${id}`);
    return res.data;
  },

  /** POST /schools */
  async create(payload: CreateSchoolPayload): Promise<School> {
    const res = await apiGateway.post<School>('/schools', payload);
    return res.data;
  },

  /** PATCH /schools/:id */
  async update(id: string, payload: UpdateSchoolPayload): Promise<School> {
    const res = await apiGateway.patch<School>(`/schools/${id}`, payload);
    return res.data;
  },

  /** DELETE /schools/:id */
  async remove(id: string): Promise<void> {
    await apiGateway.delete(`/schools/${id}`);
  },
};