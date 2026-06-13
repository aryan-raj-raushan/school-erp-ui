'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StaffService } from '@/services/staff.service';
import { DepartmentsService, type Department } from '@/services/departments.service';
import { RolesService, type Role } from '@/services/roles.service';
import { ROUTES } from '@/constants';
import type { Staff } from '@/types';

export const SCHOOL_ROLES = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'CLASS_TEACHER', label: 'Class Teacher' },
  { value: 'VICE_PRINCIPAL', label: 'Vice Principal' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'SCHOOL_ADMIN', label: 'School Admin' },
] as const;

const schema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().optional(),
  dial_code: z.string().min(1, 'Dial code is required').max(10),
  phone_number: z.string().min(7, 'Valid phone required').regex(/^\d+$/, 'Numbers only'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  role: z.enum(['SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER', 'ACCOUNTANT', 'LIBRARIAN']),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  date_of_birth: z.string().optional(),
  blood_group: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional().or(z.literal('')),
  address: z.string().optional(),
  permanent_address: z.string().optional(),
  city: z.string().max(100).optional(),
  joining_date: z.string().optional(),
  employee_code: z.string().max(50).optional(),
  department_id: z.string().optional(),
  custom_role_id: z.string().optional(),
  father_name: z.string().max(100).optional(),
  husband_name: z.string().max(100).optional(),
  reporting_to_id: z.string().optional(),
  rfid_card_number: z.string().max(50).optional(),
  qualification: z.string().max(255).optional(),
  previous_employer: z.string().max(255).optional(),
  previous_role: z.string().max(100).optional(),
  total_experience: z.string().max(100).optional(),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

export type StaffFormValues = z.infer<typeof schema>;

export function useStaffDetail(id: string | undefined) {
  const router = useRouter();
  const isNew = !id || id === 'create-new';

  const [staff, setStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isLoadingData, setIsLoadingData] = useState(!isNew);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { dial_code: '+91', role: 'TEACHER', is_active: true },
  });

  const fetchDropdownData = useCallback(async () => {
    try {
      const [depts, rolesList, staffList] = await Promise.all([
        DepartmentsService.list({ limit: 100 , is_active:true}),
        RolesService.list({ limit: 100 }),
        StaffService.list({ limit: 100 }),
      ]);
      setDepartments(depts.items);
      setRoles(rolesList.items);
      setStaffMembers(staffList.items);
    } catch {
      // non-critical — selects just won't have options
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    if (isNew) return;
    setIsLoadingData(true);
    try {
      const data = await StaffService.getById(id!);
      setStaff(data);
      setProfileImageUrl(data.profile_image ?? null);
      form.reset({
        first_name: data.first_name,
        last_name: data.last_name ?? '',
        dial_code: data.dial_code ?? '+91',
        phone_number: data.phone_number ?? '',
        email: data.email ?? '',
        role: (data.role as StaffFormValues['role']) ?? 'TEACHER',
        gender: (data.gender as StaffFormValues['gender']) ?? undefined,
        date_of_birth: data.date_of_birth ?? '',
        blood_group: (data.blood_group as StaffFormValues['blood_group']) ?? '',
        address: data.address ?? '',
        permanent_address: data.permanent_address ?? '',
        city: data.city ?? '',
        joining_date: data.joining_date?.split('T')[0] ?? '',
        employee_code: data.employee_code ?? '',
        department_id: data.department_id ?? '',
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load staff member');
      router.push(ROUTES.staffs);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, isNew, form, router]);

  useEffect(() => {
    fetchDropdownData();
    fetchStaff();
  }, [fetchDropdownData, fetchStaff]);

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

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetId = isNew ? 'temp' : id!;
    if (!isNew) {
      handleImageUpload(file, targetId);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
      // store file ref to upload after create
      (imageInputRef as any)._pendingFile = file;
    }
  }

  async function onSubmit(values: StaffFormValues) {
    if (isNew && !values.password) {
      form.setError('password', { message: 'Password is required' });
      return;
    }
    try {
      const payload = {
        ...values,
        email: values.email || undefined,
        last_name: values.last_name || undefined,
        gender: values.gender || undefined,
        date_of_birth: values.date_of_birth || undefined,
        blood_group: (values.blood_group || undefined) as any,
        address: values.address || undefined,
        permanent_address: values.permanent_address || undefined,
        city: values.city || undefined,
        joining_date: values.joining_date || undefined,
        employee_code: values.employee_code || undefined,
        department_id: values.department_id || undefined,
        custom_role_id: values.custom_role_id || undefined,
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
        // upload pending profile image if any
        const pendingFile = (imageInputRef as any)._pendingFile as File | undefined;
        if (pendingFile) {
          await handleImageUpload(pendingFile, created.id);
        }
        toast.success(`${created.first_name} added successfully`);
        router.push(ROUTES.staffs);
      } else {
        const updated = await StaffService.update(id!, payload);
        toast.success(`${updated.first_name} updated`);
        setStaff(updated);
        setIsEditing(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save staff member');
    }
  }

  function handleBack() { router.push(ROUTES.staffs); }
  function handleCancelEdit() {
    setIsEditing(false);
    if (staff) {
      form.reset({
        first_name: staff.first_name,
        last_name: staff.last_name ?? '',
        dial_code: staff.dial_code ?? '+91',
        phone_number: staff.phone_number ?? '',
        email: staff.email ?? '',
        role: (staff.role as StaffFormValues['role']) ?? 'TEACHER',
      });
    }
  }

  return {
    staff, isNew, isEditing, setIsEditing,
    form, isLoadingData,
    profileImageUrl, isUploadingImage, imageInputRef, onImageChange,
    departments, roles, staffMembers, SCHOOL_ROLES,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(onSubmit),
    handleBack, handleCancelEdit,
  };
}
