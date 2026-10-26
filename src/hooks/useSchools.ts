'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  SchoolsService,
  type SchoolFilters,
  type CreateSchoolPayload,
  type UpdateSchoolPayload,
  type SchoolAdminCredentials,
} from '@/services/schools.service';
import { BackupService } from '@/services/backup.service';
import { saveBlob } from '@/lib/save-blob';
import type { IssuedCredential } from '@/components/shared/CredentialsDialog';
import { AuthService } from '@/services/auth.service';
import { AuthContext, TokenStorage } from '@/lib/api-gateway/token.storage';
import { ImpersonationStorage } from '@/lib/impersonation.storage';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';
import {
  createSchoolSchema,
  updateSchoolSchema,
  type CreateSchoolFormValues,
  type UpdateSchoolFormValues,
} from '@/lib/validations/schools.validation';
import type { PaginationMeta, School } from '@/types';

export function useSchools(initialFilters: SchoolFilters = {}) {
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<SchoolFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);

  const { setAuth, setPermissions } = useAuthStore();
  const router = useRouter();

  const createForm = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { dial_code: '+91', admin_dial_code: '+91' },
  });

  const editForm = useForm<UpdateSchoolFormValues>({
    resolver: zodResolver(updateSchoolSchema),
  });

  const fetchSchools = useCallback(async (overrideFilters?: SchoolFilters) => {
    setIsLoading(true);
    try {
      const result = await SchoolsService.list(overrideFilters ?? filters);
      setSchools(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  function showCredentials(
    credentials: SchoolAdminCredentials | undefined,
    admin: { admin_first_name?: string; admin_last_name?: string; admin_phone?: string; admin_dial_code?: string },
  ) {
    if (!credentials) return;
    setIssuedCredentials([
      {
        name: [admin.admin_first_name, admin.admin_last_name].filter(Boolean).join(' ') || 'School Admin',
        loginId: credentials.login_id,
        password: credentials.temporary_password,
        phone: admin.admin_phone,
        dialCode: admin.admin_dial_code,
      },
    ]);
  }

  async function resetAdminPassword(school: School) {
    try {
      const [credentials, admin] = await Promise.all([
        SchoolsService.resetAdminPassword(school.id),
        SchoolsService.getAdmin(school.id),
      ]);
      showCredentials(credentials, {
        admin_first_name: admin?.first_name,
        admin_last_name: admin?.last_name ?? undefined,
        admin_phone: admin?.phone_number,
        admin_dial_code: admin?.dial_code,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset admin password');
    }
  }

  async function downloadBackup(school: School) {
    try {
      const blob = await BackupService.downloadForSchool(school.id);
      saveBlob(blob, `${school.code ?? 'school'}_backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Backup downloaded');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to download backup');
    }
  }

  async function handleCreateSubmit(values: CreateSchoolFormValues) {
    const payload: CreateSchoolPayload = {
      name: values.name,
      ...(values.email && { email: values.email }),
      ...(values.contact_number && { contact_number: values.contact_number, dial_code: values.dial_code }),
      ...(values.website && { website: values.website }),
      ...(values.address && { address: values.address }),
      ...(values.city && { city: values.city }),
      ...(values.state && { state: values.state }),
      ...(values.pincode && { pincode: values.pincode }),
      ...(values.board_type && { board_type: values.board_type }),
      ...(values.admin_first_name && { admin_first_name: values.admin_first_name }),
      ...(values.admin_last_name && { admin_last_name: values.admin_last_name }),
      ...(values.admin_phone && { admin_phone: values.admin_phone, admin_dial_code: values.admin_dial_code }),
      ...(values.admin_email && { admin_email: values.admin_email }),
    };
    try {
      const school = await SchoolsService.create(payload);
      toast.success(`${school.name} created with code ${school.code}`);
      showCredentials(school.admin_credentials, values);
      await fetchSchools();
      setShowCreateModal(false);
      createForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create school');
    }
  }

  async function handleEditSubmit(values: UpdateSchoolFormValues) {
    if (!editingSchool) return;
    const payload: UpdateSchoolPayload = {
      ...(values.name && { name: values.name }),
      ...(values.email && { email: values.email }),
      ...(values.contact_number && { contact_number: values.contact_number, dial_code: values.dial_code }),
      ...(values.website && { website: values.website }),
      ...(values.address && { address: values.address }),
      ...(values.city && { city: values.city }),
      ...(values.state && { state: values.state }),
      ...(values.pincode && { pincode: values.pincode }),
      ...(values.board_type && { board_type: values.board_type }),
      ...(values.admin_first_name && { admin_first_name: values.admin_first_name }),
      ...(values.admin_last_name && { admin_last_name: values.admin_last_name }),
      ...(values.admin_phone && { admin_phone: values.admin_phone, admin_dial_code: values.admin_dial_code }),
      ...(values.admin_email && { admin_email: values.admin_email }),
    };
    try {
      const school = await SchoolsService.update(editingSchool.id, payload);
      toast.success(`${school.name} updated`);
      showCredentials(school.admin_credentials, values);
      await fetchSchools();
      setEditingSchool(null);
      editForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update school');
    }
  }

  async function deleteSchool(school: School) {
    if (!confirm(`Delete "${school.name}"? This cannot be undone.`)) return;
    try {
      await SchoolsService.remove(school.id);
      toast.success('School deleted');
      await fetchSchools();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete school');
    }
  }

  async function loginAsSchool(school: School) {
    setSwitchingId(school.id);
    try {
      const origin = useAuthStore.getState();
      const originAccessToken = TokenStorage.getAccessToken();
      const originRefreshToken = TokenStorage.getRefreshToken();
      if (originAccessToken && originRefreshToken && origin.user && origin.context) {
        ImpersonationStorage.stash({
          accessToken: originAccessToken,
          refreshToken: originRefreshToken,
          user: origin.user,
          context: origin.context,
          permissions: origin.permissions,
        });
      }

      const result = await AuthService.switchSchool(school.id);
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.SCHOOL);
      setPermissions(profile.permissions ?? []);
      void result;
      router.replace(`${ROUTES.schoolDashboard}?impersonating=1`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to switch school');
    } finally {
      setSwitchingId(null);
    }
  }

  function openCreateModal() {
    createForm.reset({ dial_code: '+91', admin_dial_code: '+91' });
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    createForm.reset();
  }

  async function openEditModal(school: School) {
    editForm.reset({
      name: school.name,
      email: school.email ?? '',
      dial_code: school.dial_code ?? '+91',
      contact_number: school.contact_number ?? '',
      website: school.website ?? '',
      address: school.address ?? '',
      city: school.city ?? '',
      state: school.state ?? '',
      pincode: school.pincode ?? '',
      board_type: (school.board_type as any) ?? undefined,
    });
    setEditingSchool(school);

    try {
      const admin = await SchoolsService.getAdmin(school.id);
      if (admin) {
        editForm.reset({
          ...editForm.getValues(),
          admin_first_name: admin.first_name,
          admin_last_name: admin.last_name ?? '',
          admin_dial_code: admin.dial_code,
          admin_phone: admin.phone_number,
          admin_email: admin.email ?? '',
        });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load school admin details');
    }
  }

  function closeEditModal() {
    setEditingSchool(null);
    editForm.reset();
  }

  function updateFilters(next: Partial<SchoolFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  return {
    schools, pagination, filters, isLoading,
    switchingId,
    showCreateModal,
    openCreateModal,
    closeCreateModal,
    createForm,
    handleCreateSubmit: createForm.handleSubmit(handleCreateSubmit),
    isCreating: createForm.formState.isSubmitting,
    editingSchool,
    openEditModal,
    closeEditModal,
    editForm,
    handleEditSubmit: editForm.handleSubmit(handleEditSubmit),
    isUpdating: editForm.formState.isSubmitting,
    deleteSchool,
    loginAsSchool,
    resetAdminPassword,
    downloadBackup,
    issuedCredentials,
    clearIssuedCredentials: () => setIssuedCredentials([]),
    updateFilters,
  };
}
