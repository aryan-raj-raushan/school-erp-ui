"use client";

import { useExamTimetable } from "@/hooks/useExams";
import { TIMETABLE_PAGE } from "@/constants";
import {
  Div,
  H1,
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
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ExamTimetablePage() {
  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    exams,
    selectedExamId,
    setSelectedExamId,
    timetable,
    classes,
    sections,
    subjects,
    isLoading,
    isSaving,
    showModal,
    setShowModal,
    editingEntry,
    form,
    handleClassChange,
    openAddModal,
    openEditEntry,
    handleSubmit,
    handleDelete,
  } = useExamTimetable();

  const { register, formState: { errors } } = form;

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <H1>{TIMETABLE_PAGE.title}</H1>
        <Button onClick={openAddModal} disabled={!selectedExamId}>
          <Plus className="h-4 w-4 mr-1" />
          {TIMETABLE_PAGE.addButton}
        </Button>
      </Div>

      {/* Filters */}
      <Div className="rounded-xl border border-border bg-card p-4">
        <Div type="grid" cols={2} gap="md">
          <Div type="col" gap="xs">
            <P className="text-xs font-medium text-muted-foreground">Academic Year</P>
            <Select
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}{y.is_current ? " (Current)" : ""}
                </option>
              ))}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <P className="text-xs font-medium text-muted-foreground">Exam</P>
            <Select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={!selectedAcademicYearId}
            >
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
          </Div>
        </Div>
      </Div>

      {/* Timetable Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{TIMETABLE_PAGE.table.date}</TableHeaderCell>
            <TableHeaderCell>{TIMETABLE_PAGE.table.subject}</TableHeaderCell>
            <TableHeaderCell>{TIMETABLE_PAGE.table.time}</TableHeaderCell>
            <TableHeaderCell>{TIMETABLE_PAGE.table.room}</TableHeaderCell>
            <TableHeaderCell>{TIMETABLE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : !selectedExamId ? (
            <TableEmptyRow colSpan={6}>{TIMETABLE_PAGE.empty}</TableEmptyRow>
          ) : timetable.length === 0 ? (
            <TableEmptyRow colSpan={6}>No timetable entries yet.</TableEmptyRow>
          ) : (
            timetable.map((entry, i) => (
              <TableRow key={entry.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{entry.date}</TableCell>
                <TableCell>{entry.subject_id}</TableCell>
                <TableCell>
                  {entry.start_time ?? "—"} – {entry.end_time ?? "—"}
                </TableCell>
                <TableCell>{entry.room_number ?? "—"}</TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => openEditEntry(entry)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingEntry ? TIMETABLE_PAGE.form.editTitle : TIMETABLE_PAGE.form.title}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={form.handleSubmit(handleSubmit)} className="px-6 py-5">
            <Div type="col" gap="md">
              <FormField label={TIMETABLE_PAGE.form.exam} error={errors.exam_id?.message}>
                <Select {...register("exam_id")}>
                  <option value="">Select exam</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Class">
                <Select onChange={(e) => handleClassChange(e.target.value)}>
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label={TIMETABLE_PAGE.form.section} error={errors.class_section_id?.message}>
                <Select {...register("class_section_id")}>
                  <option value="">Select section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>Section {s.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label={TIMETABLE_PAGE.form.subject} error={errors.subject_id?.message}>
                <Select {...register("subject_id")}>
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label={TIMETABLE_PAGE.form.date} error={errors.date?.message}>
                <Input type="date" {...register("date")} />
              </FormField>

              <Div type="grid" cols={2} gap="md">
                <FormField label={TIMETABLE_PAGE.form.startTime}>
                  <Input type="time" {...register("start_time")} />
                </FormField>
                <FormField label={TIMETABLE_PAGE.form.endTime}>
                  <Input type="time" {...register("end_time")} />
                </FormField>
              </Div>

              <FormField label={TIMETABLE_PAGE.form.room}>
                <Input {...register("room_number")} placeholder="Room 101" />
              </FormField>

              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {TIMETABLE_PAGE.form.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {editingEntry ? TIMETABLE_PAGE.form.save : TIMETABLE_PAGE.form.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
