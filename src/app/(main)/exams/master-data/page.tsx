"use client";

import { useExams } from "@/hooks/useExams";
import { EXAMS_PAGE, MARKING_SYSTEM_OPTIONS } from "@/constants";
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
  Spinner,
  Modal,
  FormField,
} from "@/components/ui";
import { Trash2, Pencil, ChevronRight, Plus } from "lucide-react";

export default function ExamMasterDataPage() {
  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    exams,
    selectedExamId,
    selectedExam,
    handleSelectExam,
    policies,
    rooms,
    examStudents,
    isLoading,
    isSaving,
    showAddModal, setShowAddModal,
    showEditModal, setShowEditModal,
    showPolicyModal, setShowPolicyModal,
    showRoomModal, setShowRoomModal,
    addForm,
    editForm,
    policyForm,
    roomForm,
    handleCreate,
    handleEdit,
    handleDelete,
    openEditModal,
    handleAddPolicy,
    handleDeletePolicy,
    handleAddRoom,
    handleDeleteRoom,
  } = useExams();

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <H1>{EXAMS_PAGE.title}</H1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          {EXAMS_PAGE.addButton}
        </Button>
      </Div>

      {/* Academic Year filter */}
      <Div className="rounded-xl border border-border bg-card p-4">
        <Div type="row" gap="md" align="center">
          <P className="text-sm font-medium text-muted-foreground min-w-max">Academic Year</P>
          <Select
            value={selectedAcademicYearId}
            onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            className="max-w-xs"
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}{y.is_current ? " (Current)" : ""}
              </option>
            ))}
          </Select>
        </Div>
      </Div>

      {/* Exam list + detail split */}
      <Div type="grid" cols={selectedExamId ? 2 : 1} gap="lg">
        {/* Left: exam list */}
        <Div type="col" gap="sm">
          {isLoading ? (
            <Div type="col" align="center" className="py-8"><Spinner /></Div>
          ) : exams.length === 0 ? (
            <Div className="rounded-xl border border-dashed border-border p-8 text-center">
              <P className="text-muted-foreground">{EXAMS_PAGE.empty}</P>
            </Div>
          ) : (
            exams.map((exam) => (
              <Div
                key={exam.id}
                onClick={() => handleSelectExam(exam.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                  selectedExamId === exam.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <Div type="row" justify="between" align="center">
                  <Div type="col" gap="xs">
                    <P className="font-medium">{exam.name}</P>
                    {(exam.start_date || exam.end_date) && (
                      <P className="text-xs text-muted-foreground">
                        {exam.start_date ?? "—"} → {exam.end_date ?? "—"}
                      </P>
                    )}
                    {exam.description && (
                      <P className="text-xs text-muted-foreground">{exam.description}</P>
                    )}
                  </Div>
                  <Div type="row" gap="xs" align="center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); openEditModal(exam); }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Div>
                </Div>
              </Div>
            ))
          )}
        </Div>

        {/* Right: exam detail */}
        {selectedExam && (
          <Div type="col" gap="md">
            {/* Summary badges */}
            <Div type="row" gap="sm">
              <Div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                <P className="text-xs text-muted-foreground">Students</P>
                <H2>{examStudents.length}</H2>
              </Div>
              <Div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                <P className="text-xs text-muted-foreground">Policies</P>
                <H2>{policies.length}</H2>
              </Div>
              <Div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                <P className="text-xs text-muted-foreground">Rooms</P>
                <H2>{rooms.length}</H2>
              </Div>
            </Div>

            {/* Policy section */}
            <Div className="rounded-xl border border-border bg-card p-4">
              <Div type="row" justify="between" align="center" className="mb-3">
                <P className="font-medium">{EXAMS_PAGE.policy.title}</P>
                <Button size="sm" variant="outline" onClick={() => setShowPolicyModal(true)}>
                  <Plus className="h-3 w-3 mr-1" />{EXAMS_PAGE.policy.addButton}
                </Button>
              </Div>
              {policies.length === 0 ? (
                <P className="text-sm text-muted-foreground">{EXAMS_PAGE.policy.empty}</P>
              ) : (
                <Div type="col" gap="xs">
                  {policies.map((p) => (
                    <Div key={p.id} type="row" justify="between" align="center" className="rounded-lg bg-muted/40 px-3 py-2">
                      <Div type="col" gap="xs">
                        <P className="text-sm font-medium">{p.name}</P>
                        <P className="text-xs text-muted-foreground">
                          {p.total_marks != null && `Total: ${p.total_marks}`}
                          {p.passing_marks != null && ` · Pass: ${p.passing_marks}`}
                          {p.marking_system && ` · ${p.marking_system}`}
                          {p.grace_marks != null && ` · Grace: ${p.grace_marks}`}
                        </P>
                      </Div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePolicy(p.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </Div>
                  ))}
                </Div>
              )}
            </Div>

            {/* Rooms section */}
            <Div className="rounded-xl border border-border bg-card p-4">
              <Div type="row" justify="between" align="center" className="mb-3">
                <P className="font-medium">{EXAMS_PAGE.rooms.title}</P>
                <Button size="sm" variant="outline" onClick={() => setShowRoomModal(true)}>
                  <Plus className="h-3 w-3 mr-1" />{EXAMS_PAGE.rooms.addButton}
                </Button>
              </Div>
              {rooms.length === 0 ? (
                <P className="text-sm text-muted-foreground">{EXAMS_PAGE.rooms.empty}</P>
              ) : (
                <Table>
                  <TableHead>
                    <TableHeadRow>
                      <TableHeaderCell>Room</TableHeaderCell>
                      <TableHeaderCell>Capacity</TableHeaderCell>
                      <TableHeaderCell></TableHeaderCell>
                    </TableHeadRow>
                  </TableHead>
                  <TableBody>
                    {rooms.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell primary>{r.room_name}</TableCell>
                        <TableCell>{r.capacity}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteRoom(r.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Div>
          </Div>
        )}
      </Div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <Modal title={EXAMS_PAGE.form.title} onClose={() => setShowAddModal(false)}>
          <form onSubmit={addForm.handleSubmit(handleCreate)} className="px-6 py-5">
            <Div type="col" gap="md">
              <FormField label={EXAMS_PAGE.form.name} error={addForm.formState.errors.name?.message}>
                <Input {...addForm.register("name")} placeholder="Mid-Term Examination 2025" />
              </FormField>
              <FormField label={EXAMS_PAGE.form.description}>
                <Input {...addForm.register("description")} placeholder="Description (optional)" />
              </FormField>
              <Div type="grid" cols={2} gap="md">
                <FormField label={EXAMS_PAGE.form.startDate}>
                  <Input type="date" {...addForm.register("start_date")} />
                </FormField>
                <FormField label={EXAMS_PAGE.form.endDate}>
                  <Input type="date" {...addForm.register("end_date")} />
                </FormField>
              </Div>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  {EXAMS_PAGE.form.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {EXAMS_PAGE.form.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Edit Exam Modal */}
      {showEditModal && (
        <Modal title={EXAMS_PAGE.form.editTitle} onClose={() => setShowEditModal(false)}>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="px-6 py-5">
            <Div type="col" gap="md">
              <FormField label={EXAMS_PAGE.form.name} error={editForm.formState.errors.name?.message}>
                <Input {...editForm.register("name")} />
              </FormField>
              <FormField label={EXAMS_PAGE.form.description}>
                <Input {...editForm.register("description")} />
              </FormField>
              <Div type="grid" cols={2} gap="md">
                <FormField label={EXAMS_PAGE.form.startDate}>
                  <Input type="date" {...editForm.register("start_date")} />
                </FormField>
                <FormField label={EXAMS_PAGE.form.endDate}>
                  <Input type="date" {...editForm.register("end_date")} />
                </FormField>
              </Div>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  {EXAMS_PAGE.form.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {EXAMS_PAGE.form.save}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Add Policy Modal */}
      {showPolicyModal && (
        <Modal title={EXAMS_PAGE.policy.title} onClose={() => setShowPolicyModal(false)}>
          <form onSubmit={policyForm.handleSubmit(handleAddPolicy)} className="px-6 py-5">
            <Div type="col" gap="md">
              <FormField label={EXAMS_PAGE.policy.name} error={policyForm.formState.errors.name?.message}>
                <Input {...policyForm.register("name")} placeholder="Standard Marking Policy" />
              </FormField>
              <Div type="grid" cols={2} gap="md">
                <FormField label={EXAMS_PAGE.policy.totalMarks}>
                  <Input type="number" {...policyForm.register("total_marks")} placeholder="100" />
                </FormField>
                <FormField label={EXAMS_PAGE.policy.passingMarks}>
                  <Input type="number" {...policyForm.register("passing_marks")} placeholder="35" />
                </FormField>
              </Div>
              <Div type="grid" cols={2} gap="md">
                <FormField label={EXAMS_PAGE.policy.markingSystem}>
                  <Select {...policyForm.register("marking_system")}>
                    {MARKING_SYSTEM_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label={EXAMS_PAGE.policy.graceMarks}>
                  <Input type="number" {...policyForm.register("grace_marks")} placeholder="3" />
                </FormField>
              </Div>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowPolicyModal(false)}>
                  {EXAMS_PAGE.policy.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {EXAMS_PAGE.policy.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Add Room Modal */}
      {showRoomModal && (
        <Modal title={EXAMS_PAGE.rooms.title} onClose={() => setShowRoomModal(false)}>
          <form onSubmit={roomForm.handleSubmit(handleAddRoom)} className="px-6 py-5">
            <Div type="col" gap="md">
              <FormField label={EXAMS_PAGE.rooms.name} error={roomForm.formState.errors.room_name?.message}>
                <Input {...roomForm.register("room_name")} placeholder="Main Hall" />
              </FormField>
              <FormField label={EXAMS_PAGE.rooms.capacity} error={roomForm.formState.errors.capacity?.message}>
                <Input type="number" {...roomForm.register("capacity")} placeholder="40" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowRoomModal(false)}>
                  {EXAMS_PAGE.rooms.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {EXAMS_PAGE.rooms.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
