"use client";

import { useMemo } from "react";
import { useExamTimetable } from "@/hooks/useExams";
import { TIMETABLE_PAGE } from "@/constants";
import {
  Div,
  H1,
  P,
  Button,
  Select,
  Input,
  DataTable,
  Spinner,
  Modal,
  FormField,
  FilterLabel,
  Icon,
  type ColumnDef,
} from "@/components/ui";
import { Pencil, Trash2, Plus } from "lucide-react";

type TimetableRow = {
  id: string;
  date: string;
  subject_id: string;
  start_time?: string;
  end_time?: string;
  room_number?: string;
};

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

  const columns = useMemo<ColumnDef<TimetableRow>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "date",
        header: TIMETABLE_PAGE.table.date,
        meta: { primary: true },
      },
      {
        accessorKey: "subject_id",
        header: TIMETABLE_PAGE.table.subject,
      },
      {
        id: "time",
        header: TIMETABLE_PAGE.table.time,
        cell: ({ row }) => `${row.original.start_time ?? "—"} – ${row.original.end_time ?? "—"}`,
      },
      {
        accessorKey: "room_number",
        header: TIMETABLE_PAGE.table.room,
        cell: ({ row }) => row.original.room_number ?? "—",
      },
      {
        id: "actions",
        header: TIMETABLE_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button size="sm" variant="ghost" onClick={() => openEditEntry(row.original as any)}>
              <Icon icon={Pencil} type="sm" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(row.original.id)}>
              <Icon icon={Trash2} type="sm-danger" />
            </Button>
          </Div>
        ),
      },
    ],
    [openEditEntry, handleDelete]
  );

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <H1>{TIMETABLE_PAGE.title}</H1>
        <Button onClick={openAddModal} disabled={!selectedExamId}>
          <Icon icon={Plus} type="btn-icon" />
          {TIMETABLE_PAGE.addButton}
        </Button>
      </Div>

      {/* Filters */}
      <Div variant="card" padding="p-4">
        <Div type="grid" cols={2} gap="md">
          <Div type="col" gap="xs">
            <FilterLabel>Academic Year</FilterLabel>
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
            <FilterLabel>Exam</FilterLabel>
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

      <DataTable
        columns={columns}
        data={timetable.map((entry) => ({
          ...entry,
          start_time: entry.start_time ?? undefined,
          end_time: entry.end_time ?? undefined,
          room_number: entry.room_number ?? undefined,
        }))}
        isLoading={isLoading}
        emptyText={!selectedExamId ? TIMETABLE_PAGE.empty : "No timetable entries yet."}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingEntry ? TIMETABLE_PAGE.form.editTitle : TIMETABLE_PAGE.form.title}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Div type="col" gap="md" padding="px-6 py-5">
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
