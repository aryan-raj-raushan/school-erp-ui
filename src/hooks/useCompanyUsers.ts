'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CompanyUsersService,
  type CompanyUserFilters,
  type CreateCompanyUserPayload,
  type CompanyUser,
  type AssignedSchool,
} from '@/services/company-users.service';
import { SchoolsService } from '@/services/schools.service';
import {
  createCompanyUserSchema,
  type CreateCompanyUserFormValues,
} from '@/lib/validations/company-users.validation';
import type { PaginationMeta, School } from '@/types';

export function useCompanyUsers(initialFilters: CompanyUserFilters = {}) {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<CompanyUserFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [managingSchoolsFor, setManagingSchoolsFor] = useState<CompanyUser | null>(null);
  const [assignedSchools, setAssignedSchools] = useState<AssignedSchool[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);

  const createForm = useForm<CreateCompanyUserFormValues>({
    resolver: zodResolver(createCompanyUserSchema),
  });

  const fetchUsers = useCallback(async (overrideFilters?: CompanyUserFilters) => {
    setIsLoading(true);
    try {
      const result = await CompanyUsersService.list(overrideFilters ?? filters);
      setUsers(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function handleCreateSubmit(values: CreateCompanyUserFormValues) {
    const payload: CreateCompanyUserPayload = {
      first_name: values.first_name,
      ...(values.last_name && { last_name: values.last_name }),
      email: values.email,
      password: values.password,
      role: values.role,
    };
    try {
      const user = await CompanyUsersService.create(payload);
      toast.success(`${user.first_name} created`);
      await fetchUsers();
      setShowCreateModal(false);
      createForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create team member');
    }
  }

  async function toggleActive(user: CompanyUser) {
    try {
      await CompanyUsersService.update(user.id, { is_active: !user.is_active });
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update team member');
    }
  }

  async function deleteUser(user: CompanyUser) {
    if (!confirm(`Delete "${user.first_name}"? This cannot be undone.`)) return;
    try {
      await CompanyUsersService.remove(user.id);
      toast.success('Team member deleted');
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete team member');
    }
  }

  async function openSchoolsModal(user: CompanyUser) {
    setManagingSchoolsFor(user);
    setIsSchoolsLoading(true);
    try {
      const [schools, all] = await Promise.all([
        CompanyUsersService.listSchools(user.id),
        allSchools.length ? Promise.resolve(allSchools) : SchoolsService.list({ limit: 100 }).then((r) => r.items),
      ]);
      setAssignedSchools(schools);
      setAllSchools(all);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load schools');
    } finally {
      setIsSchoolsLoading(false);
    }
  }

  function closeSchoolsModal() {
    setManagingSchoolsFor(null);
    setAssignedSchools([]);
  }

  async function assignSchool(schoolId: string) {
    if (!managingSchoolsFor) return;
    try {
      const schools = await CompanyUsersService.assignSchool(managingSchoolsFor.id, schoolId);
      setAssignedSchools(schools);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign school');
    }
  }

  async function unassignSchool(schoolId: string) {
    if (!managingSchoolsFor) return;
    try {
      const schools = await CompanyUsersService.unassignSchool(managingSchoolsFor.id, schoolId);
      setAssignedSchools(schools);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to unassign school');
    }
  }

  function openCreateModal() {
    createForm.reset({});
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    createForm.reset();
  }

  function updateFilters(next: Partial<CompanyUserFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return {
    users, pagination, filters, isLoading,
    showCreateModal, openCreateModal, closeCreateModal,
    createForm,
    handleCreateSubmit: createForm.handleSubmit(handleCreateSubmit),
    isCreating: createForm.formState.isSubmitting,
    toggleActive,
    deleteUser,
    updateFilters,
    managingSchoolsFor, assignedSchools, allSchools, isSchoolsLoading,
    openSchoolsModal, closeSchoolsModal, assignSchool, unassignSchool,
  };
}
