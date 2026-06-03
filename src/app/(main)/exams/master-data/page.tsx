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
  MiniStat,
  FilterLabel,
  Icon,
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
          <Icon icon={Plus} type="btn-icon" />
          {EXAMS_PAGE.addButton}
        </Button>
      </Div>

      {/* Academic Year filter */}
      <Div variant="card" padding="p-4">
        <Div type="row" gap="md" align="center">
          <FilterLabel noWrap>Academic Year</FilterLabel>
          <Select
            value={selectedAcademicYearId}
            onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            width="md"
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
            <Div type="col" align="center" padding="py-8"><Spinner /></Div>
          ) : exams.length === 0 ? (
            <Div variant="card-dashed">
              <P>{EXAMS_PAGE.empty}</P>
            </Div>
          ) : (
            exams.map((exam) => (
              <Div
                key={exam.id}
                variant="card"
                padding="p-4"
                interactive
                selected={selectedExamId === exam.id}
                onClick={() => handleSelectExam(exam.id)}
              >
                <Div type="row" justify="between" align="center">
                  <Div type="col" gap="xs">
                    <P color="default" weight="medium">{exam.name}</P>
                    {(exam.start_date || exam.end_date) && (
                      <P size="xs">{exam.start_date ?? "—"} → {exam.end_date ?? "—"}</P>
                    )}
                    {exam.description && (
                      <P size="xs">{exam.description}</P>
                    )}
                  </Div>
                  <Div type="row" gap="xs" align="center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); openEditModal(exam); }}
                    >
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }}
                    >
                      <Icon icon={Trash2} type="sm-danger" />
                    </Button>
                    <Icon icon={ChevronRight} type="muted" />
                  </Div>
                </Div>
              </Div>
            ))
          )}
        </Div>

        {/* Right: exam detail */}
        {selectedExam && (
          <Div type="col" gap="md">
            {/* Summary */}
            <Div type="row" gap="sm">
              <MiniStat label="Students" value={examStudents.length} />
              <MiniStat label="Policies" value={policies.length} />
              <MiniStat label="Rooms" value={rooms.length} />
            </Div>

            {/* Policy section */}
            <Div variant="card" padding="p-4">
              <Div type="row" justify="between" align="center" padding="mb-3">
                <P color="default" weight="medium">{EXAMS_PAGE.policy.title}</P>
                <Button size="sm" variant="outline" onClick={() => setShowPolicyModal(true)}>
                  <Icon icon={Plus} type="sm-inline" />{EXAMS_PAGE.policy.addButton}
                </Button>
              </Div>
              {policies.length === 0 ? (
                <P>{EXAMS_PAGE.policy.empty}</P>
              ) : (
                <Div type="col" gap="xs">
                  {policies.map((p) => (
                    <Div key={p.id} variant="inset" type="row" justify="between" align="center">
                      <Div type="col" gap="xs">
                        <P color="default" weight="medium">{p.name}</P>
                        <P size="xs">
                          {p.total_marks != null && `Total: ${p.total_marks}`}
                          {p.passing_marks != null && ` · Pass: ${p.passing_marks}`}
                          {p.marking_system && ` · ${p.marking_system}`}
                          {p.grace_marks != null && ` · Grace: ${p.grace_marks}`}
                        </P>
                      </Div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePolicy(p.id)}>
                        <Icon icon={Trash2} type="sm-danger" />
                      </Button>
                    </Div>
                  ))}
                </Div>
              )}
            </Div>

            {/* Rooms section */}
            <Div variant="card" padding="p-4">
              <Div type="row" justify="between" align="center" padding="mb-3">
                <P color="default" weight="medium">{EXAMS_PAGE.rooms.title}</P>
                <Button size="sm" variant="outline" onClick={() => setShowRoomModal(true)}>
                  <Icon icon={Plus} type="sm-inline" />{EXAMS_PAGE.rooms.addButton}
                </Button>
              </Div>
              {rooms.length === 0 ? (
                <P>{EXAMS_PAGE.rooms.empty}</P>
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
                            <Icon icon={Trash2} type="sm-danger" />
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
          <form onSubmit={addForm.handleSubmit(handleCreate)}>
            <Div type="col" gap="md" padding="px-6 py-5">
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
                <Button type="submit" loading={isSaving}>{EXAMS_PAGE.form.submit}</Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Edit Exam Modal */}
      {showEditModal && (
        <Modal title={EXAMS_PAGE.form.editTitle} onClose={() => setShowEditModal(false)}>
          <form onSubmit={editForm.handleSubmit(handleEdit)}>
            <Div type="col" gap="md" padding="px-6 py-5">
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
                <Button type="submit" loading={isSaving}>{EXAMS_PAGE.form.save}</Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Add Policy Modal */}
      {showPolicyModal && (
        <Modal title={EXAMS_PAGE.policy.title} onClose={() => setShowPolicyModal(false)}>
          <form onSubmit={policyForm.handleSubmit(handleAddPolicy)}>
            <Div type="col" gap="md" padding="px-6 py-5">
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
                <Button type="submit" loading={isSaving}>{EXAMS_PAGE.policy.submit}</Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Add Room Modal */}
      {showRoomModal && (
        <Modal title={EXAMS_PAGE.rooms.title} onClose={() => setShowRoomModal(false)}>
          <form onSubmit={roomForm.handleSubmit(handleAddRoom)}>
            <Div type="col" gap="md" padding="px-6 py-5">
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
                <Button type="submit" loading={isSaving}>{EXAMS_PAGE.rooms.submit}</Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
