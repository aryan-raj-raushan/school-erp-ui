'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlatformFilePicker } from './usePlatformFilePicker';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { StaffService } from '@/services/staff.service';
import { RolesService, type Role } from '@/services/roles.service';
import { ROUTES, REGEX } from '@/constants';
import { FORM_STORAGE_KEYS } from '@/constants/form-storage-keys.constants';
import { useSavedForm } from '@/hooks/useSavedForm';
import type { Staff } from '@/types';
import { createStaffSchema, updateStaffSchema, type StaffFormValues } from '@/lib/validations/staff.validation';

export type { StaffFormValues };

/** Display label for a staff member's role — resolves custom roles by id, falls back to the enum-role's matching system role. */
export function getStaffRoleLabel(staff: Staff | null | undefined, roles: Role[]): string | undefined {
  if (!staff) return undefined;
  if (staff.custom_role_id) {
    return roles.find((r) => r.id === staff.custom_role_id)?.name;
  }
  if (staff.role) {
    return roles.find((r) => r.is_system && r.slug.toUpperCase() === staff.role)?.name ?? staff.role;
  }
  return undefined;
}

export function useStaffDetail(id: string | undefined) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = !id || id === 'create-new';

  const [staff, setStaff] = useState<Staff | null>(null);
  const [staffId, setStaffId] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isLoadingData, setIsLoadingData] = useState(!isNew);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { isNative, pickImage } = usePlatformFilePicker();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(isNew ? createStaffSchema : updateStaffSchema) as any,
    defaultValues: { dial_code: '+91', is_active: true },
  });

  const savedForm = useSavedForm<StaffFormValues>({
    key: FORM_STORAGE_KEYS.STAFF_CREATE,
    form,
    enabled: isNew,
    sanitize: (values) => ({ ...values, password: '' }),
  });

  const fetchDropdownData = useCallback(async () => {
    try {
      const [rolesList, staffList] = await Promise.all([
        RolesService.list({ limit: 100 }),
        StaffService.list({ limit: 100 }),
      ]);
      setAllRoles(rolesList.items);
      setStaffMembers(staffList.items);
    } catch {
      // non-critical — selects just won't have options
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    if (isNew) return;
    try {
      let data: Staff;
      if (REGEX.uuid.test(id!)) {
        data = await StaffService.getById(id!);
      } else {
        const cachedId = typeof window !== 'undefined' ? sessionStorage.getItem(`staff_slug:${id}`) : null;
        if (cachedId) {
          data = await StaffService.getById(cachedId);
        } else {
          const searchName = id!.replace(/-/g, ' ');
          const result = await StaffService.list({ search: searchName, limit: 20 });
          const slug = id!.toLowerCase();
          const match = result.items.find((s) => {
            const nameSlug = `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return nameSlug === slug;
          }) ?? result.items[0];
          if (!match) throw new Error('Staff member not found');
          data = await StaffService.getById(match.id);
        }
      }
      setStaff(data);
      setStaffId(data.id);
      setProfileImageUrl(data.profile_image ?? null);
      resetFormFromStaff(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load staff member');
      router.push(ROUTES.staffs);
    }
  }, [id, isNew, form, router]);

  useEffect(() => {
    if (!isNew) setIsLoadingData(true);
    Promise.all([fetchDropdownData(), fetchStaff()]).finally(() => {
      if (!isNew) setIsLoadingData(false);
    });
  }, [fetchDropdownData, fetchStaff, isNew]);

  // Backfills the role picker for staff assigned a base system role (no
  // custom_role_id) — resolves once the roles list has loaded, regardless of
  // which of the two parallel fetches above lands first.
  useEffect(() => {
    if (!staff || staff.custom_role_id || allRoles.length === 0) return;
    const matchingSystemRole = allRoles.find((r) => r.is_system && r.slug.toUpperCase() === staff.role);
    if (matchingSystemRole) form.setValue('role_id', matchingSystemRole.id);
  }, [staff, allRoles, form]);

  useEffect(() => {
    if (searchParams.get('edit') === 'true' && !isNew) setIsEditing(true);
  }, [searchParams, isNew]);

  async function handleImageUpload(file: File, staffId: string) {
    setIsUploadingImage(true);
    try {
      const { url } = await StaffService.uploadProfileImage(file, staffId);
      setProfileImageUrl(url);
      await StaffService.update(staffId, { profile_image: url });
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleNativeImagePick() {
    const file = await pickImage();
    if (!file) return;
    const targetId = isNew ? 'temp' : (staffId ?? staff?.id ?? id!);
    if (!isNew) {
      handleImageUpload(file, targetId);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
      (imageInputRef as any)._pendingFile = file;
    }
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetId = isNew ? 'temp' : (staffId ?? staff?.id ?? id!);
    if (!isNew) {
      handleImageUpload(file, targetId);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
      (imageInputRef as any)._pendingFile = file;
    }
  }

  async function onSubmit(values: StaffFormValues) {
    try {
      const selectedRole = allRoles.find((r) => r.id === values.role_id);
      const role = selectedRole?.is_system ? (selectedRole.slug.toUpperCase() as any) : undefined;
      const custom_role_id = selectedRole && !selectedRole.is_system ? selectedRole.id : undefined;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- role_id is a picker-only field, excluded from the API payload
      const { role_id: _roleId, ...rest } = values;

      const payload = {
        ...rest,
        email: values.email || undefined,
        last_name: values.last_name || undefined,
        gender: values.gender || undefined,
        date_of_birth: values.date_of_birth || undefined,
        role,
        blood_group: (values.blood_group || undefined) as any,
        address: values.address || undefined,
        permanent_address: values.permanent_address || undefined,
        city: values.city || undefined,
        joining_date: values.joining_date || undefined,
        employee_code: values.employee_code || undefined,
        custom_role_id,
        father_name: values.father_name || undefined,
        husband_name: values.husband_name || undefined,
        reporting_to_id: values.reporting_to_id || undefined,
        rfid_card_number: values.rfid_card_number || undefined,
        qualification: values.qualification || undefined,
        previous_employer: values.previous_employer || undefined,
        previous_role: values.previous_role || undefined,
        total_experience: values.total_experience || undefined,
        password: values.password || undefined,
        is_active: values.is_active ?? true,
      };

      if (isNew) {
        const { staff: created } = await StaffService.create(payload);
        const pendingFile = (imageInputRef as any)._pendingFile as File | undefined;
        if (pendingFile) {
          await handleImageUpload(pendingFile, created.id);
        }
        savedForm.clearSavedForm();
        toast.success(`${created.first_name} added successfully`);
        router.push(ROUTES.staffs);
      } else {
        const updated = await StaffService.update(staffId ?? staff!.id, payload);
        toast.success(`${updated.first_name} updated`);
        setStaff(updated);
        setIsEditing(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save staff member');
    }
  }

  function resetFormFromStaff(data: Staff) {
    const toDate = (v: unknown) =>
      v ? (typeof v === 'string' ? v.split('T')[0] : new Date(v as string).toISOString().split('T')[0]) : '';
    form.reset({
      first_name: data.first_name,
      last_name: data.last_name ?? '',
      dial_code: data.dial_code ?? '+91',
      phone_number: data.phone_number ?? '',
      email: data.email ?? '',
      role: data.role ?? '',
      role_id: data.custom_role_id ?? '',
      gender: (data.gender as StaffFormValues['gender']) ?? undefined,
      date_of_birth: toDate(data.date_of_birth),
      blood_group: (data.blood_group as StaffFormValues['blood_group']) ?? '',
      address: data.address ?? '',
      permanent_address: data.permanent_address ?? '',
      city: data.city ?? '',
      joining_date: toDate(data.joining_date),
      employee_code: data.employee_code ?? '',
      custom_role_id: data.custom_role_id ?? '',
      father_name: data.father_name ?? '',
      husband_name: data.husband_name ?? '',
      reporting_to_id: data.reporting_to_id ?? '',
      rfid_card_number: data.rfid_card_number ?? '',
      qualification: data.qualification ?? '',
      previous_employer: data.previous_employer ?? '',
      previous_role: data.previous_role ?? '',
      total_experience: data.total_experience ?? '',
    });
  }

  function handleBack() { router.push(ROUTES.staffs); }
  function handleCancelEdit() {
    setIsEditing(false);
    if (staff) resetFormFromStaff(staff);
  }

  const roles = allRoles.filter((r) => r.is_active);

  const fullName = staff ? `${staff.first_name ?? ''} ${staff.last_name ?? ''}`.trim() : 'New Employee';
  const reportingToName = (() => {
    const m = staffMembers.find((s) => s.id === staff?.reporting_to_id);
    return m ? `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() : (staff?.reporting_to_id ?? undefined);
  })();

  return {
    staff, isNew, isEditing, setIsEditing,
    form, isLoadingData,
    profileImageUrl, isUploadingImage, imageInputRef, onImageChange, handleNativeImagePick,
    isNative,
    roles, staffMembers,
    fullName, reportingToName,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(onSubmit),
    handleBack, handleCancelEdit,
    hasSavedDraft: savedForm.hasDraft,
    restoreSavedDraft: savedForm.restoreDraft,
    discardSavedDraft: savedForm.discardDraft,
  };
}
