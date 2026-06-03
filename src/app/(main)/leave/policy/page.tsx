"use client";

import { useLeavePolicy } from "@/hooks/useLeave";
import { LEAVE_POLICY_PAGE } from "@/constants";
import {
  Div,
  H1,
  H2,
  P,
  Button,
  Select,
  Input,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  Badge,
  Spinner,
  Modal,
  FormField,
  FilterLabel,
  Icon,
  CheckboxLabel,
} from "@/components/ui";
import { Plus, ChevronRight, Trash2, Settings } from "lucide-react";

export default function LeavePolicyPage() {
  const {
    years,
    policies,
    selectedPolicy,
    isLoading,
    isSaving,
    showModal, setShowModal,
    showProvisionModal, setShowProvisionModal,
    provisionAcademicYearId, setProvisionAcademicYearId,
    form,
    fields,
    append,
    remove,
    handleSelectPolicy,
    handleCreate,
    handleProvision,
  } = useLeavePolicy();

  const { register, handleSubmit, formState: { errors }, watch } = form;

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <H1>{LEAVE_POLICY_PAGE.title}</H1>
        <Button onClick={() => setShowModal(true)}>
          <Icon icon={Plus} type="btn-icon" />
          {LEAVE_POLICY_PAGE.addButton}
        </Button>
      </Div>

      <Div type="grid" cols={selectedPolicy ? 2 : 1} gap="lg">
        {/* Left: policy list */}
        <Div type="col" gap="sm">
          {isLoading ? (
            <Div type="col" align="center" padding="py-8"><Spinner /></Div>
          ) : policies.length === 0 ? (
            <Div variant="card-dashed">
              <P>{LEAVE_POLICY_PAGE.empty}</P>
            </Div>
          ) : (
            policies.map((policy) => (
              <Div
                key={policy.id}
                variant="card"
                padding="p-4"
                interactive
                selected={selectedPolicy?.id === policy.id}
                onClick={() => handleSelectPolicy(policy)}
              >
                <Div type="row" justify="between" align="center">
                  <Div type="col" gap="xs">
                    <P color="default" weight="medium">{policy.name}</P>
                    {policy.description && <P size="xs">{policy.description}</P>}
                    <P size="xs">
                      {policy.leave_types?.length ?? 0} leave type(s)
                    </P>
                  </Div>
                  <Icon icon={ChevronRight} type="muted" />
                </Div>
              </Div>
            ))
          )}
        </Div>

        {/* Right: policy detail */}
        {selectedPolicy && (
          <Div type="col" gap="md">
            {/* Header + actions */}
            <Div type="row" justify="between" align="center">
              <Div type="col" gap="xs">
                <H2>{selectedPolicy.name}</H2>
                {selectedPolicy.description && <P size="xs">{selectedPolicy.description}</P>}
              </Div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowProvisionModal(true)}
              >
                <Icon icon={Settings} type="sm-inline" />
                Provision Staff
              </Button>
            </Div>

            {/* Leave types table */}
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeaderCell>{LEAVE_POLICY_PAGE.table.leaveType}</TableHeaderCell>
                  <TableHeaderCell>{LEAVE_POLICY_PAGE.table.maxDays}</TableHeaderCell>
                  <TableHeaderCell>{LEAVE_POLICY_PAGE.table.paid}</TableHeaderCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {!selectedPolicy.leave_types?.length ? (
                  <TableEmptyRow colSpan={3}>No leave types defined.</TableEmptyRow>
                ) : (
                  selectedPolicy.leave_types.map((lt) => (
                    <TableRow key={lt.id}>
                      <TableCell primary>{lt.name}</TableCell>
                      <TableCell>{lt.max_days} days</TableCell>
                      <TableCell>
                        <Badge variant={lt.is_paid ? "success" : "default"}>
                          {lt.is_paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Div>
        )}
      </Div>

      {/* Create Policy Modal */}
      {showModal && (
        <Modal title={LEAVE_POLICY_PAGE.form.title} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit(handleCreate)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label={LEAVE_POLICY_PAGE.form.policyName} error={errors.name?.message}>
                <Input {...register("name")} placeholder="Annual Leave Policy 2025-26" />
              </FormField>
              <FormField label={LEAVE_POLICY_PAGE.form.description}>
                <Input {...register("description")} placeholder="Optional description" />
              </FormField>

              {/* Leave types */}
              <Div type="col" gap="sm">
                <Div type="row" justify="between" align="center">
                  <P color="default" weight="medium">{LEAVE_POLICY_PAGE.form.leaveTypes}</P>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => append({ name: '', max_days: '1', is_paid: true, description: '' })}
                  >
                    <Icon icon={Plus} type="sm-inline" />
                    {LEAVE_POLICY_PAGE.form.addType}
                  </Button>
                </Div>

                {fields.map((field, index) => (
                  <Div key={field.id} variant="inset" type="col" gap="sm">
                    <Div type="grid" cols={2} gap="sm">
                      <FormField
                        label={LEAVE_POLICY_PAGE.form.typeName}
                        error={errors.leave_types?.[index]?.name?.message}
                      >
                        <Input
                          {...register(`leave_types.${index}.name`)}
                          placeholder="Casual Leave"
                        />
                      </FormField>
                      <FormField
                        label={LEAVE_POLICY_PAGE.form.maxDays}
                        error={errors.leave_types?.[index]?.max_days?.message}
                      >
                        <Input
                          type="number"
                          min={1}
                          {...register(`leave_types.${index}.max_days`)}
                          placeholder="12"
                        />
                      </FormField>
                    </Div>
                    <Div type="row" justify="between" align="center">
                      <Div type="row" align="center" gap="sm">
                        <input
                          type="checkbox"
                          id={`paid-${index}`}
                          {...register(`leave_types.${index}.is_paid`)}
                        />
                        <CheckboxLabel htmlFor={`paid-${index}`}>
                          {LEAVE_POLICY_PAGE.form.isPaid}
                        </CheckboxLabel>
                      </Div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => remove(index)}
                        >
                          <Icon icon={Trash2} type="sm-danger" />
                        </Button>
                      )}
                    </Div>
                  </Div>
                ))}
              </Div>

              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {LEAVE_POLICY_PAGE.form.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {LEAVE_POLICY_PAGE.form.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Provision Modal */}
      {showProvisionModal && (
        <Modal title={LEAVE_POLICY_PAGE.provision.title} onClose={() => setShowProvisionModal(false)}>
          <Div type="col" gap="md" padding="px-6 py-5">
            <P>{LEAVE_POLICY_PAGE.provision.desc}</P>
            <FormField label={LEAVE_POLICY_PAGE.provision.academicYear}>
              <Select
                value={provisionAcademicYearId}
                onChange={(e) => setProvisionAcademicYearId(e.target.value)}
              >
                <option value="">Select academic year</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}{y.is_current ? " (Current)" : ""}
                  </option>
                ))}
              </Select>
            </FormField>
            <Div type="row" justify="end" gap="sm">
              <Button variant="outline" onClick={() => setShowProvisionModal(false)}>
                {LEAVE_POLICY_PAGE.provision.cancel}
              </Button>
              <Button
                loading={isSaving}
                disabled={!provisionAcademicYearId}
                onClick={() => handleProvision([])}
              >
                {LEAVE_POLICY_PAGE.provision.submit}
              </Button>
            </Div>
          </Div>
        </Modal>
      )}
    </Div>
  );
}
