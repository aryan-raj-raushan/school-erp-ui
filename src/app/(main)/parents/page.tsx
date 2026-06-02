"use client";

import { useParents } from "@/hooks/useParents";
import { PARENTS_PAGE } from "@/constants";
import {
  Div,
  H1,
  P,
  Button,
  Input,
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
} from "@/components/ui";

export default function ParentsPage() {
  const {
    parents,
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
    deleteParent,
    showLinkModal,
    linkingParent,
    openLinkModal,
    closeLinkModal,
    linkForm,
    handleLinkSubmit,
    isLinkSubmitting,
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
  } = useParents();

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>{PARENTS_PAGE.title}</H1>
          <P>{pagination ? `${pagination.total} parents` : "Loading..."}</P>
        </Div>
        <Div type="row" gap="sm">
          <Button variant="outline" onClick={downloadTemplate}>
            {PARENTS_PAGE.downloadTemplate}
          </Button>
          <Button variant="outline" onClick={openBulkModal}>
            {PARENTS_PAGE.bulkImport}
          </Button>
          <Button onClick={openModal}>{PARENTS_PAGE.addButton}</Button>
        </Div>
      </Div>

      <Div type="row" gap="md" align="center" wrap>
        <Input
          width="md"
          placeholder="Search by name or email"
          value={filters.search ?? ""}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{PARENTS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{PARENTS_PAGE.table.email}</TableHeaderCell>
            <TableHeaderCell>{PARENTS_PAGE.table.phone}</TableHeaderCell>
            <TableHeaderCell>{PARENTS_PAGE.table.occupation}</TableHeaderCell>
            <TableHeaderCell>{PARENTS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{PARENTS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}>
              <Spinner />
            </TableEmptyRow>
          ) : parents.length === 0 ? (
            <TableEmptyRow colSpan={6}>{PARENTS_PAGE.empty}</TableEmptyRow>
          ) : (
            parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell primary>
                  {parent.first_name} {parent.last_name ?? ""}
                </TableCell>
                <TableCell>{parent.email ?? "—"}</TableCell>
                <TableCell>
                  {parent.phone_number
                    ? `${parent.dial_code ?? ""} ${parent.phone_number}`
                    : "—"}
                </TableCell>
                <TableCell>{parent.occupation ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={parent.is_active ? "success" : "default"}>
                    {parent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(parent)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openLinkModal(parent)}
                    >
                      Link Student
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteParent(parent.id)}
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

      {/* Add Parent Modal */}
      {showModal && (
        <Modal onClose={closeModal} title={PARENTS_PAGE.form.title}>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <Div type="grid" cols={2} gap="md">
                  <FormField
                    label={PARENTS_PAGE.form.firstName}
                    error={form.formState.errors.first_name?.message}
                  >
                    <Input
                      placeholder={PARENTS_PAGE.placeholders.firstName}
                      {...form.register("first_name")}
                    />
                  </FormField>
                  <FormField
                    label={PARENTS_PAGE.form.lastName}
                    error={form.formState.errors.last_name?.message}
                  >
                    <Input
                      placeholder={PARENTS_PAGE.placeholders.lastName}
                      {...form.register("last_name")}
                    />
                  </FormField>
                </Div>
                <FormField
                  label={PARENTS_PAGE.form.email}
                  error={form.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder={PARENTS_PAGE.placeholders.email}
                    {...form.register("email")}
                  />
                </FormField>
                <Div type="row" gap="sm">
                  <FormField
                    label={PARENTS_PAGE.form.dialCode}
                    error={form.formState.errors.dial_code?.message}
                  >
                    <Input
                      width="xs"
                      placeholder={PARENTS_PAGE.placeholders.dialCode}
                      {...form.register("dial_code")}
                    />
                  </FormField>
                  <FormField
                    label={PARENTS_PAGE.form.phone}
                    error={form.formState.errors.phone_number?.message}
                  >
                    <Input
                      type="tel"
                      placeholder={PARENTS_PAGE.placeholders.phone}
                      {...form.register("phone_number")}
                    />
                  </FormField>
                </Div>
                <FormField
                  label={PARENTS_PAGE.form.occupation}
                  error={form.formState.errors.occupation?.message}
                >
                  <Input
                    placeholder={PARENTS_PAGE.placeholders.occupation}
                    {...form.register("occupation")}
                  />
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                {PARENTS_PAGE.form.cancel}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {PARENTS_PAGE.form.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Edit Parent Modal */}
      {showEditModal && (
        <Modal onClose={closeEditModal} title={PARENTS_PAGE.editForm.title}>
          <form onSubmit={handleEditSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <Div type="grid" cols={2} gap="md">
                  <FormField
                    label={PARENTS_PAGE.form.firstName}
                    error={editForm.formState.errors.first_name?.message}
                  >
                    <Input
                      placeholder={PARENTS_PAGE.placeholders.firstName}
                      {...editForm.register("first_name")}
                    />
                  </FormField>
                  <FormField
                    label={PARENTS_PAGE.form.lastName}
                    error={editForm.formState.errors.last_name?.message}
                  >
                    <Input
                      placeholder={PARENTS_PAGE.placeholders.lastName}
                      {...editForm.register("last_name")}
                    />
                  </FormField>
                </Div>
                <FormField
                  label={PARENTS_PAGE.form.email}
                  error={editForm.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder={PARENTS_PAGE.placeholders.email}
                    {...editForm.register("email")}
                  />
                </FormField>
                <Div type="row" gap="sm">
                  <FormField
                    label={PARENTS_PAGE.form.dialCode}
                    error={editForm.formState.errors.dial_code?.message}
                  >
                    <Input
                      width="xs"
                      placeholder={PARENTS_PAGE.placeholders.dialCode}
                      {...editForm.register("dial_code")}
                    />
                  </FormField>
                  <FormField
                    label={PARENTS_PAGE.form.phone}
                    error={editForm.formState.errors.phone_number?.message}
                  >
                    <Input
                      type="tel"
                      placeholder={PARENTS_PAGE.placeholders.phone}
                      {...editForm.register("phone_number")}
                    />
                  </FormField>
                </Div>
                <FormField
                  label={PARENTS_PAGE.form.occupation}
                  error={editForm.formState.errors.occupation?.message}
                >
                  <Input
                    placeholder={PARENTS_PAGE.placeholders.occupation}
                    {...editForm.register("occupation")}
                  />
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeEditModal}>
                {PARENTS_PAGE.editForm.cancel}
              </Button>
              <Button type="submit" loading={isEditSubmitting}>
                {PARENTS_PAGE.editForm.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Link Student Modal */}
      {showLinkModal && (
        <Modal
          onClose={closeLinkModal}
          title={`${PARENTS_PAGE.linkStudentForm.title} — ${linkingParent?.first_name}`}
        >
          <form onSubmit={handleLinkSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField
                  label={PARENTS_PAGE.linkStudentForm.studentId}
                  error={linkForm.formState.errors.student_id?.message}
                >
                  <Input
                    placeholder={PARENTS_PAGE.placeholders.studentId}
                    {...linkForm.register("student_id")}
                  />
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeLinkModal}>
                {PARENTS_PAGE.linkStudentForm.cancel}
              </Button>
              <Button type="submit" loading={isLinkSubmitting}>
                {PARENTS_PAGE.linkStudentForm.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <Modal onClose={closeBulkModal} title={PARENTS_PAGE.bulkImportForm.title}>
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label={PARENTS_PAGE.bulkImportForm.file}>
                <input
                  ref={bulkFileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="text-sm text-foreground"
                />
              </FormField>
              {bulkJob && (
                <Div type="col" gap="xs">
                  <P>Job ID: {bulkJob.jobId}</P>
                  <P>Status: {bulkJob.status}</P>
                  {bulkJob.processed != null && (
                    <P>Processed: {bulkJob.processed} / {bulkJob.total}</P>
                  )}
                  {bulkJob.failed != null && bulkJob.failed > 0 && (
                    <P>Failed: {bulkJob.failed}</P>
                  )}
                </Div>
              )}
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={closeBulkModal}>
              {PARENTS_PAGE.bulkImportForm.cancel}
            </Button>
            {bulkJob && (
              <Button type="button" variant="outline" onClick={checkBulkStatus}>
                Check Status
              </Button>
            )}
            <Button type="button" loading={isImporting} onClick={bulkImport}>
              {PARENTS_PAGE.bulkImportForm.submit}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Div>
  );
}
