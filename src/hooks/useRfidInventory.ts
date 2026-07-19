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
import type { PaginationMeta, RfidDevice, OneTimeChargeType } from '@/types';

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningDevice, setAssigningDevice] = useState<RfidDevice | null>(null);

  const createForm = useForm<CreateRfidDevicePayload>();
  const assignForm = useForm<AssignFormValues>({ defaultValues: { billable: false } });

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

  async function handleCreateSubmit(values: CreateRfidDevicePayload) {
    try {
      const device = await RfidInventoryService.create(values);
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
      await RfidInventoryService.assign(assigningDevice.id, payload);
      toast.success('Device assigned');
      await fetchDevices();
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
      await fetchDevices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update device');
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
    setAssigningDevice(device);
  }

  function closeAssignModal() {
    setAssigningDevice(null);
    assignForm.reset();
  }

  function updateFilters(next: Partial<RfidDeviceFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  return {
    devices, pagination, filters, isLoading, updateFilters,
    showCreateModal, openCreateModal, closeCreateModal,
    createForm,
    handleCreateSubmit: createForm.handleSubmit(handleCreateSubmit),
    isCreating: createForm.formState.isSubmitting,
    assigningDevice, openAssignModal, closeAssignModal,
    assignForm,
    handleAssignSubmit: assignForm.handleSubmit(handleAssignSubmit),
    isAssigning: assignForm.formState.isSubmitting,
    installDevice, returnDevice,
  };
}
