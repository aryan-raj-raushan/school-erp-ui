'use client';

import { useState } from 'react';
import { useLeavePolicies } from '@/hooks/useLeavePolicies';
import {
  PageCol,
  PageHeader,
  Div,
  P,
  Button,
  Badge,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
  FormField,
  Input,
  EmptyState,
} from '@/components/ui';
import type { CreateLeavePolicyPayload } from '@/services/leave.service';

const EMPTY_FORM: CreateLeavePolicyPayload = {
  name: '',
  academic_year_id: '',
  description: '',
  leave_types: [{ name: 'Casual Leave', max_days: 12, is_paid: true }],
};

export default function LeavePolicyPage() {
  const {
    policies, isLoading, isSaving, isDialogOpen, editingPolicy,
    openCreate, openEdit, closeDialog, submit,
  } = useLeavePolicies();

  const [form, setForm] = useState<CreateLeavePolicyPayload>(EMPTY_FORM);

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    openCreate();
  };

  const handleOpenEdit = (policy: (typeof policies)[number]) => {
    setForm({
      name: policy.name,
      academic_year_id: policy.academic_year_id,
      description: policy.description ?? '',
      leave_types: policy.leave_types?.map((lt) => ({
        name: lt.name,
        max_days: lt.max_days,
        is_paid: lt.is_paid ?? true,
        description: lt.description ?? '',
      })) ?? [],
    });
    openEdit(policy);
  };

  const updateForm = <K extends keyof CreateLeavePolicyPayload>(key: K, value: CreateLeavePolicyPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addLeaveType = () =>
    updateForm('leave_types', [...(form.leave_types ?? []), { name: '', max_days: 0, is_paid: true }]);

  const updateLeaveType = (i: number, key: string, value: string | number | boolean) =>
    updateForm(
      'leave_types',
      (form.leave_types ?? []).map((lt, idx) => (idx === i ? { ...lt, [key]: value } : lt)),
    );

  const removeLeaveType = (i: number) =>
    updateForm('leave_types', (form.leave_types ?? []).filter((_, idx) => idx !== i));

  if (isLoading) {
    return (
      <PageCol>
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      </PageCol>
    );
  }

  return (
    <PageCol>
      <PageHeader
        title="Leave Policies"
        subtitle="Configure leave types and annual allocations for staff"
        actions={<Button onClick={handleOpenCreate}>New Policy</Button>}
      />

      {policies.length === 0 ? (
        <EmptyState
          title="No leave policies"
          description="Create a leave policy with leave types and allocate to staff"
          action={{ label: 'New Policy', onClick: handleOpenCreate }}
        />
      ) : (
        <Div type="col" gap="md">
          {policies.map((policy) => (
            <Div key={policy.id} variant="card" type="col" gap="sm" padding="p-5">
              <Div type="row" justify="between" align="start">
                <Div type="col" gap="xs">
                  <P color="default" weight="medium">{policy.name}</P>
                  {policy.description && <P size="xs">{policy.description}</P>}
                </Div>
                <Button size="xs" variant="outline" onClick={() => handleOpenEdit(policy)}>Edit</Button>
              </Div>
              {policy.leave_types && policy.leave_types.length > 0 && (
                <Div type="row" gap="xs" wrap>
                  {policy.leave_types.map((lt) => (
                    <Badge key={lt.id} variant={lt.is_paid ? 'success' : 'default'}>
                      {lt.name} · {lt.max_days}d {lt.is_paid ? '(paid)' : '(unpaid)'}
                    </Badge>
                  ))}
                </Div>
              )}
            </Div>
          ))}
        </Div>
      )}

      {isDialogOpen && (
        <Modal onClose={closeDialog} title={editingPolicy ? 'Edit Policy' : 'New Leave Policy'}>
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label="Policy Name">
                <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Staff Leave Policy 2024-25" />
              </FormField>
              {!editingPolicy && (
                <FormField label="Academic Year ID">
                  <Input value={form.academic_year_id} onChange={(e) => updateForm('academic_year_id', e.target.value)} placeholder="Paste academic year UUID" />
                </FormField>
              )}
              <FormField label="Description (optional)">
                <Input value={form.description ?? ''} onChange={(e) => updateForm('description', e.target.value)} placeholder="Annual leave policy for all teaching staff" />
              </FormField>

              {!editingPolicy && (
                <Div type="col" gap="sm">
                  <Div type="row" justify="between" align="center">
                    <P weight="medium">Leave Types</P>
                    <Button size="xs" variant="outline" onClick={addLeaveType}>+ Add Type</Button>
                  </Div>
                  {(form.leave_types ?? []).map((lt, i) => (
                    <Div key={i} variant="card" type="col" gap="sm" padding="p-3">
                      <Div type="grid" cols={2} gap="sm">
                        <FormField label="Name">
                          <Input value={lt.name} onChange={(e) => updateLeaveType(i, 'name', e.target.value)} placeholder="Casual Leave" />
                        </FormField>
                        <FormField label="Max Days">
                          <Input type="number" value={lt.max_days} onChange={(e) => updateLeaveType(i, 'max_days', Number(e.target.value))} />
                        </FormField>
                      </Div>
                      <Div type="row" justify="between" align="center">
                        <Button
                          size="xs"
                          variant={lt.is_paid ? 'default' : 'outline'}
                          onClick={() => updateLeaveType(i, 'is_paid', !lt.is_paid)}
                        >
                          {lt.is_paid ? 'Paid' : 'Unpaid'}
                        </Button>
                        {(form.leave_types ?? []).length > 1 && (
                          <Button size="xs" variant="destructive" onClick={() => removeLeaveType(i)}>Remove</Button>
                        )}
                      </Div>
                    </Div>
                  ))}
                </Div>
              )}
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button loading={isSaving} onClick={() => submit(form)}>
              {editingPolicy ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
