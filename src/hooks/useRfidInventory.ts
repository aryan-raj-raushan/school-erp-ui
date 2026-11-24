'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  RfidInventoryService,
  type RfidDeviceFilters,
  type CreateRfidDevicePayload,
  type AssignRfidDevicePayload,
} from '@/services/rfid-inventory.service';
import type { PaginationMeta, RfidDevice, OneTimeChargeType, DiscoveredRfidDevice } from '@/types';
import { confirmCreate } from '@/components/ui/confirm-dialog';

interface AssignTarget {
  id: string | null;
  device_identifier: string;
}

interface AssignFormValues {
  school_id: string;
  billable: boolean;
  charge_type?: OneTimeChargeType;
  charge_amount?: number;
}

export function useRfidInventory(initialFilters: RfidDeviceFilters = {}) {
  const [devices, setDevices] = useState<RfidDevice[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<RfidDeviceFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredRfidDevice[]>([]);
  const [isLoadingDiscovered, setIsLoadingDiscovered] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningDevice, setAssigningDevice] = useState<AssignTarget | null>(null);

  const createForm = useForm<CreateRfidDevicePayload>({ mode: 'onTouched' });
  const assignForm = useForm<AssignFormValues>({ mode: 'onTouched', defaultValues: { billable: false } });

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await RfidInventoryService.list(filters);
      setDevices(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchDiscovered = useCallback(async () => {
    setIsLoadingDiscovered(true);
    try {
      setDiscovered(await RfidInventoryService.discovered());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load discovered devices');
    } finally {
      setIsLoadingDiscovered(false);
    }
  }, []);

  async function handleCreateSubmit(values: CreateRfidDevicePayload) {
    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== '' && v != null),
      ) as CreateRfidDevicePayload;
      if (!(await confirmCreate('this smart-card device'))) return;
      const device = await RfidInventoryService.create(payload);
      toast.success(`${device.device_identifier} added`);
      await fetchDevices();
      setShowCreateModal(false);
      createForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add device');
    }
  }

  async function handleAssignSubmit(values: AssignFormValues) {
    if (!assigningDevice) return;
    const payload: AssignRfidDevicePayload = {
      school_id: values.school_id,
      billable: values.billable,
      ...(values.billable && values.charge_type && { charge_type: values.charge_type }),
      ...(values.billable && values.charge_amount != null && { charge_amount: Number(values.charge_amount) }),
    };
    try {
      if (assigningDevice.id) {
        await RfidInventoryService.assign(assigningDevice.id, payload);
      } else {
        await RfidInventoryService.map({ ...payload, device_identifier: assigningDevice.device_identifier });
      }
      toast.success(`${assigningDevice.device_identifier} mapped to school`);
      await Promise.all([fetchDevices(), fetchDiscovered()]);
      setAssigningDevice(null);
      assignForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign device');
    }
  }

  async function installDevice(device: RfidDevice) {
    try {
      await RfidInventoryService.install(device.id);
      toast.success('Device marked installed');
      await fetchDevices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update device');
    }
  }

  async function returnDevice(device: RfidDevice) {
    try {
      await RfidInventoryService.returnDevice(device.id);
      toast.success('Device returned to stock');
      await Promise.all([fetchDevices(), fetchDiscovered()]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update device');
    }
  }

  async function deleteDevice(device: RfidDevice) {
    try {
      await RfidInventoryService.remove(device.id);
      toast.success(`${device.device_identifier} deleted`);
      await fetchDevices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete device');
    }
  }

  function openCreateModal() {
    createForm.reset();
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    createForm.reset();
  }

  function openAssignModal(device: RfidDevice) {
    assignForm.reset({ billable: false });
    setAssigningDevice({ id: device.id, device_identifier: device.device_identifier });
  }

  function openMapModal(device: DiscoveredRfidDevice) {
    assignForm.reset({ billable: false });
    setAssigningDevice({ id: device.inventory_id, device_identifier: device.device_identifier });
  }

  function closeAssignModal() {
    setAssigningDevice(null);
    assignForm.reset();
  }

  function updateFilters(next: Partial<RfidDeviceFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }

  useEffect(() => { fetchDevices(); }, [fetchDevices]);
  useEffect(() => { fetchDiscovered(); }, [fetchDiscovered]);

  return {
    devices, pagination, filters, isLoading, updateFilters,
    discovered, isLoadingDiscovered, refetchDiscovered: fetchDiscovered, openMapModal,
    showCreateModal, openCreateModal, closeCreateModal,
    createForm,
    handleCreateSubmit: createForm.handleSubmit(handleCreateSubmit),
    isCreating: createForm.formState.isSubmitting,
    assigningDevice, openAssignModal, closeAssignModal,
    assignForm,
    handleAssignSubmit: assignForm.handleSubmit(handleAssignSubmit),
    isAssigning: assignForm.formState.isSubmitting,
    installDevice, returnDevice, deleteDevice,
  };
}
