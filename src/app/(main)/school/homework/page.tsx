"use client";

import { useHomework } from "@/hooks/useHomework";
import { HOMEWORK_PAGE, SUBMISSION_STATUS_OPTIONS, SUBMISSION_STATUS_BADGE } from "@/constants";
import {
  Div, H1, P, Button, Select, Input,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Modal, FormField, FilterLabel, FileInput, Icon,
} from "@/components/ui";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";

export default function HomeworkPage() {
  const {
    years, selectedAcademicYearId, setSelectedAcademicYearId,
    classes, sections, subjects,
    selectedClassId, selectedSectionId, selectedSubjectId,
    setSelectedSectionId, setSelectedSubjectId,
    handleClassChange,
    homeworkList,
    students, submissionMap,
    isLoading, isSaving, isUploading,
    showModal, setShowModal,
    showSubmissionsModal, setShowSubmissionsModal,
    editingId, form, fileRef,
    openAddModal, openEditModal,
    handleSubmit, handleDelete,
    openSubmissions, setSubmission, saveSubmissions,
  } = useHomework();

  const { register, handleSubmit: onSubmit, formState: { errors } } = form;

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <H1>{HOMEWORK_PAGE.title}</H1>
        <Button onClick={openAddModal} disabled={!selectedSectionId || !selectedSubjectId}>
          <Icon icon={Plus} type="btn-icon" />
          {HOMEWORK_PAGE.addButton}
        </Button>
      </Div>

      {/* Filters */}
      <Div variant="card" padding="p-4">
        <Div type="grid" cols={4} gap="md">
          <Div type="col" gap="xs">
            <FilterLabel>Academic Year</FilterLabel>
            <Select value={selectedAcademicYearId} onChange={(e) => setSelectedAcademicYearId(e.target.value)}>
              <option value="">Select year</option>
              {years.map((y) => <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Class</FilterLabel>
            <Select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)} disabled={!selectedAcademicYearId}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Section</FilterLabel>
            <Select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} disabled={!selectedClassId}>
              <option value="">Select section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Subject</FilterLabel>
            <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} disabled={!selectedSectionId}>
              <option value="">All subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Div>
        </Div>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.title}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.subject}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.dueDate}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : !selectedSectionId ? (
            <TableEmptyRow colSpan={5}>{HOMEWORK_PAGE.empty}</TableEmptyRow>
          ) : homeworkList.length === 0 ? (
            <TableEmptyRow colSpan={5}>No homework assigned yet.</TableEmptyRow>
          ) : (
            homeworkList.map((hw, i) => {
              const sub = subjects.find((s) => s.id === hw.subject_id);
              return (
                <TableRow key={hw.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{hw.title}</TableCell>
                  <TableCell>{sub?.name ?? '—'}</TableCell>
                  <TableCell>{hw.due_date}</TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button size="sm" variant="ghost" onClick={() => openSubmissions(hw)}>
                        <Icon icon={ListChecks} type="sm" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(hw)}>
                        <Icon icon={Pencil} type="sm" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(hw.id)}>
                        <Icon icon={Trash2} type="sm-danger" />
                      </Button>
                    </Div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Add / Edit Homework Modal */}
      {showModal && (
        <Modal
          title={editingId ? HOMEWORK_PAGE.form.editTitle : HOMEWORK_PAGE.form.title}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={onSubmit(handleSubmit)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label={HOMEWORK_PAGE.form.hwTitle} error={errors.title?.message}>
                <Input {...register("title")} placeholder="Chapter 5 Exercise" />
              </FormField>
              <FormField label={HOMEWORK_PAGE.form.description}>
                <Input {...register("description")} placeholder="Optional description" />
              </FormField>
              <FormField label={HOMEWORK_PAGE.form.dueDate} error={errors.due_date?.message}>
                <Input type="date" {...register("due_date")} />
              </FormField>
              <FormField label={HOMEWORK_PAGE.form.attachmentUrl}>
                <Div type="col" gap="xs">
                  <Input {...register("attachment_url")} placeholder="https://... (or upload below)" />
                  <FileInput ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png" />
                </Div>
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {HOMEWORK_PAGE.form.cancel}
                </Button>
                <Button type="submit" loading={isSaving || isUploading}>
                  {editingId ? HOMEWORK_PAGE.form.save : HOMEWORK_PAGE.form.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <Modal title={HOMEWORK_PAGE.submissions.title} onClose={() => setShowSubmissionsModal(false)} size="lg">
          <Div type="col" gap="md" padding="px-6 py-5">
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeaderCell>{HOMEWORK_PAGE.submissions.table.student}</TableHeaderCell>
                  <TableHeaderCell>{HOMEWORK_PAGE.submissions.table.status}</TableHeaderCell>
                  <TableHeaderCell>{HOMEWORK_PAGE.submissions.table.remarks}</TableHeaderCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {students.length === 0 ? (
                  <TableEmptyRow colSpan={3}>{HOMEWORK_PAGE.submissions.empty}</TableEmptyRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell primary>{s.first_name} {s.last_name ?? ''}</TableCell>
                      <TableCell>
                        <Select
                          value={submissionMap[s.id]?.status ?? 'PENDING'}
                          onChange={(e) => setSubmission(s.id, 'status', e.target.value)}
                          width="sm"
                        >
                          {SUBMISSION_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Remarks"
                          value={submissionMap[s.id]?.remarks ?? ''}
                          onChange={(e) => setSubmission(s.id, 'remarks', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Div type="row" justify="end" gap="sm">
              <Button variant="outline" onClick={() => setShowSubmissionsModal(false)}>Cancel</Button>
              <Button loading={isSaving} onClick={saveSubmissions}>{HOMEWORK_PAGE.submissions.save}</Button>
            </Div>
          </Div>
        </Modal>
      )}
    </Div>
  );
}
