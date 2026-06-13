'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { RolesService } from '@/services/roles.service';
import { PermissionsService, type GroupedPermissions } from '@/services/permissions.service';
import { ROUTES } from '@/constants';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type RoleFormValues = z.infer<typeof schema>;

export function useRoleDetail(id: string | undefined) {
  const router = useRouter();
  const isNew = !id || id === 'create-new';

  const [isEditing, setIsEditing] = useState(isNew);
  const [isLoadingData, setIsLoadingData] = useState(!isNew);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [isSystem, setIsSystem] = useState(false);
  const [roleName, setRoleName] = useState('');

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { is_active: true },
  });

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [grouped, ...rest] = await Promise.all([
        PermissionsService.listGrouped(),
        ...(isNew ? [] : [
          RolesService.getById(id!),
          RolesService.getRolePermissions(id!),
        ]),
      ]);

      setGroupedPermissions(grouped);

      if (!isNew) {
        const role = rest[0] as Awaited<ReturnType<typeof RolesService.getById>>;
        const assignedSlugs = rest[1] as string[];

        setIsSystem(role.is_system);
        setRoleName(role.name);

        const slugSet = new Set(assignedSlugs);
        const allPerms = Object.values(grouped).flatMap((p) => p);
        const assignedIds = new Set(allPerms.filter((p) => slugSet.has(p.name)).map((p) => p.id));
        setSelectedPermissionIds(assignedIds);

        form.reset({
          name: role.name,
          description: role.description ?? '',
          is_active: role.is_active,
        });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load role');
      if (!isNew) router.push(ROUTES.roles);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, isNew, form, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function togglePermission(permId: string) {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  }

  function toggleResourceAll(resource: string) {
    const ids = groupedPermissions[resource]?.map((p) => p.id) ?? [];
    const allSelected = ids.every((id) => selectedPermissionIds.has(id));
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      allSelected ? ids.forEach((id) => next.delete(id)) : ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleSelectAll() {
    const allIds = Object.values(groupedPermissions).flatMap((p) => p.map((x) => x.id));
    const allSelected = allIds.every((id) => selectedPermissionIds.has(id));
    setSelectedPermissionIds(allSelected ? new Set() : new Set(allIds));
  }

  function toggleIsActive() { form.setValue('is_active', !form.getValues('is_active')); }

  async function onSubmit(values: RoleFormValues) {
    try {
      if (isNew) {
        const role = await RolesService.create({
          name: values.name,
          description: values.description || undefined,
          is_active: values.is_active,
        });
        if (selectedPermissionIds.size > 0) {
          await RolesService.assignPermissions(role.id, [...selectedPermissionIds]);
        }
        toast.success(`${role.name} created`);
        router.push(ROUTES.roles);
      } else {
        await Promise.all([
          RolesService.update(id!, {
            name: isSystem ? undefined : values.name,
            description: values.description || undefined,
            is_active: values.is_active,
          }),
          RolesService.assignPermissions(id!, [...selectedPermissionIds]),
        ]);
        toast.success('Role updated');
        setIsEditing(false);
        setRoleName(isSystem ? roleName : values.name);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save role');
    }
  }

  function handleBack() { router.push(ROUTES.roles); }
  function handleCancelEdit() { setIsEditing(false); form.reset(); }

  return {
    isNew,
    isEditing,
    setIsEditing,
    isSystem,
    roleName,
    form,
    groupedPermissions,
    selectedPermissionIds,
    isLoadingData,
    togglePermission,
    toggleResourceAll,
    toggleSelectAll,
    toggleIsActive,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(onSubmit),
    handleBack,
    handleCancelEdit,
  };
}
