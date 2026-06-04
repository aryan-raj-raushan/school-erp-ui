"use client";

import { useStaff } from "@/hooks/useStaff";
import {
  STAFF_PAGE,
  STAFF_STATUS_BADGE,
  STAFF_STATUS_OPTIONS,
  STAFF_ROLE_OPTIONS,
  GENDER_OPTIONS,
} from "@/constants";
import {
  Div,
  H1,
  P,
  Button,
  Input,
  Select,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
  Modal,
  ModalBody,
  ModalFooter,
  FormField,
  Badge,
  Spinner,
  FileInput,
} from "@/components/ui";

export default function StaffsPage() {
  const {
    staffList,
    pagination,
    filters,
    isLoading,
    showModal,
    openModal,
    closeModal,
    form,
    handleSubmit,
    isSubmitting,
    showEditModal,
    openEditModal,
    closeEditModal,
    editForm,
    handleEditSubmit,
    isEditSubmitting,
    deleteStaff,
    showOffboardModal,
    offboardingStaff,
    openOffboardModal,
    closeOffboardModal,
    offboardForm,
    handleOffboardSubmit,
    reonboardStaff,
    resendInvite,
    showBulkModal,
    openBulkModal,
    closeBulkModal,
    bulkJob,
    bulkFileRef,
    isImporting,
    bulkImport,
    checkBulkStatus,
    downloadTemplate,
    updateFilters,
  } = useStaff();

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>{STAFF_PAGE.title}</H1>
          <P>{pagination ? `${pagination.total} staff members` : "Loading..."}</P>
        </Div>
        <Div type="row" gap="sm">
          <Button variant="outline" onClick={downloadTemplate}>
            {STAFF_PAGE.downloadTemplate}
          </Button>
          <Button variant="outline" onClick={openBulkModal}>
            {STAFF_PAGE.bulkImport}
          </Button>
          <Button onClick={openModal}>{STAFF_PAGE.addButton}</Button>
        </Div>
      </Div>

      <Div type="row" gap="md" align="center" wrap>
        <Input
          width="md"
          placeholder="Search by name or employee ID"
          value={filters.search ?? ""}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
        <Select
          width="sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            updateFilters({ status: (e.target.value as any) || undefined })
          }
        >
          {STAFF_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{STAFF_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{STAFF_PAGE.table.role}</TableHeaderCell>
            <TableHeaderCell>{STAFF_PAGE.table.email}</TableHeaderCell>
            <TableHeaderCell>{STAFF_PAGE.table.phone}</TableHeaderCell>
            <TableHeaderCell>{STAFF_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{STAFF_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}>
              <Spinner />
            </TableEmptyRow>
          ) : staffList.length === 0 ? (
            <TableEmptyRow colSpan={7}>{STAFF_PAGE.empty}</TableEmptyRow>
          ) : (
            staffList.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell primary>
                  {staff.first_name} {staff.last_name ?? ""}
                </TableCell>
                <TableCell>{staff.staff_role ?? "—"}</TableCell>
                <TableCell>{staff.email ?? "—"}</TableCell>
                <TableCell>{staff.phone_number ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={STAFF_STATUS_BADGE[staff.status]}>
                    {staff.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(staff)}
                    >
                      Edit
                    </Button>
                    {staff.status === "OFFBOARDED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reonboardStaff(staff.id)}
                      >
                        Re-onboard
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openOffboardModal(staff)}
                      >
                        Offboard
                      </Button>
                    )}
                    {staff.user_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resendInvite(staff.user_id!)}
                      >
                        Resend Invite
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteStaff(staff.id)}
                    >
                      Delete
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <Modal onClose={closeModal} title={STAFF_PAGE.form.title}>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STAFF_PAGE.form.firstName} error={form.formState.errors.first_name?.message}>
                    <Input placeholder={STAFF_PAGE.placeholders.firstName} {...form.register("first_name")} />
                  </FormField>
                  <FormField label={STAFF_PAGE.form.lastName}>
                    <Input placeholder={STAFF_PAGE.placeholders.lastName} {...form.register("last_name")} />
                  </FormField>
                </Div>
                <FormField label={STAFF_PAGE.form.role} error={form.formState.errors.role?.message}>
                  <Select {...form.register("role")}>
                    <option value="">Select role</option>
                    {STAFF_ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label={STAFF_PAGE.form.email} error={form.formState.errors.email?.message}>
                  <Input type="email" placeholder={STAFF_PAGE.placeholders.email} {...form.register("email")} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STAFF_PAGE.form.dialCode} error={form.formState.errors.dial_code?.message}>
                    <Input width="xs" placeholder={STAFF_PAGE.placeholders.dialCode} {...form.register("dial_code")} />
                  </FormField>
                  <FormField label={STAFF_PAGE.form.phone} error={form.formState.errors.phone_number?.message}>
                    <Input type="tel" placeholder={STAFF_PAGE.placeholders.phone} {...form.register("phone_number")} />
                  </FormField>
                </Div>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STAFF_PAGE.form.gender}>
                    <Select {...form.register("gender")}>
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label={STAFF_PAGE.form.dateOfBirth}>
                    <Input type="date" {...form.register("date_of_birth")} />
                  </FormField>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                {STAFF_PAGE.form.cancel}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {STAFF_PAGE.form.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <Modal onClose={closeEditModal} title={STAFF_PAGE.editForm.title}>
          <form onSubmit={handleEditSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STAFF_PAGE.form.firstName} error={editForm.formState.errors.first_name?.message}>
                    <Input placeholder={STAFF_PAGE.placeholders.firstName} {...editForm.register("first_name")} />
                  </FormField>
                  <FormField label={STAFF_PAGE.form.lastName}>
                    <Input placeholder={STAFF_PAGE.placeholders.lastName} {...editForm.register("last_name")} />
                  </FormField>
                </Div>
                <FormField label={STAFF_PAGE.form.email} error={editForm.formState.errors.email?.message}>
                  <Input type="email" placeholder={STAFF_PAGE.placeholders.email} {...editForm.register("email")} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STAFF_PAGE.form.dialCode} error={editForm.formState.errors.dial_code?.message}>
                    <Input width="xs" placeholder={STAFF_PAGE.placeholders.dialCode} {...editForm.register("dial_code")} />
                  </FormField>
                  <FormField label={STAFF_PAGE.form.phone} error={editForm.formState.errors.phone_number?.message}>
                    <Input type="tel" placeholder={STAFF_PAGE.placeholders.phone} {...editForm.register("phone_number")} />
                  </FormField>
                </Div>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STAFF_PAGE.form.gender}>
                    <Select {...editForm.register("gender")}>
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label={STAFF_PAGE.form.dateOfBirth}>
                    <Input type="date" {...editForm.register("date_of_birth")} />
                  </FormField>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeEditModal}>
                {STAFF_PAGE.editForm.cancel}
              </Button>
              <Button type="submit" loading={isEditSubmitting}>
                {STAFF_PAGE.editForm.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Offboard Modal */}
      {showOffboardModal && (
        <Modal
          onClose={closeOffboardModal}
          title={`${STAFF_PAGE.offboardForm.title} — ${offboardingStaff?.first_name}`}
        >
          <form onSubmit={handleOffboardSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label={STAFF_PAGE.offboardForm.reason}>
                  <Input
                    placeholder="Resignation, contract end, etc."
                    {...offboardForm.register("reason")}
                  />
                </FormField>
                <FormField label={STAFF_PAGE.offboardForm.offboardDate}>
                  <Input type="date" {...offboardForm.register("offboard_date")} />
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeOffboardModal}>
                {STAFF_PAGE.offboardForm.cancel}
              </Button>
              <Button type="submit">
                {STAFF_PAGE.offboardForm.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <Modal onClose={closeBulkModal} title={STAFF_PAGE.bulkImportForm.title}>
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label={STAFF_PAGE.bulkImportForm.file}>
                <FileInput
                  ref={bulkFileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                />
              </FormField>
              {bulkJob && (
                <Div type="col" gap="xs">
                  <P>Job ID: {bulkJob.jobId}</P>
                  <P>Status: {bulkJob.status}</P>
                  {bulkJob.processed != null && <P>Processed: {bulkJob.processed} / {bulkJob.total}</P>}
                  {bulkJob.failed != null && bulkJob.failed > 0 && (
                    <P>Failed: {bulkJob.failed}</P>
                  )}
                </Div>
              )}
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={closeBulkModal}>
              {STAFF_PAGE.bulkImportForm.cancel}
            </Button>
            {bulkJob && (
              <Button type="button" variant="outline" onClick={checkBulkStatus}>
                Check Status
              </Button>
            )}
            <Button type="button" loading={isImporting} onClick={bulkImport}>
              {STAFF_PAGE.bulkImportForm.submit}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Div>
  );
}
