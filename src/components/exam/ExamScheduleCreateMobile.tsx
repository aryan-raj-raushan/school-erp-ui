"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { ChevronDown, Plus, Trash2, Wand2, Zap } from "lucide-react";
import {
  Button,
  BottomSheet,
  ControlledSelectField,
  ControlledToggleRow,
  FieldRow,
  FormGroup,
  MobileMultiSelectField,
  MobileSelectField,
  MobileTextField,
  StepHeader,
  StickyActionBar,
} from "@/components/ui";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import {
  useExamScheduleForm,
  type ScheduleFormInput,
} from "@/hooks/exam/useExamSchedule";
import { SCHEDULE_PAGE, EXAM_ROUTES, SUBJECT_TYPE_OPTIONS } from "@/constants/exam.constants";

type ScheduleControl = Control<ScheduleFormInput, unknown>;

const SUB_SUBJECT_TYPES = SUBJECT_TYPE_OPTIONS.filter((o) => o.value !== "MAIN_EXAM");

function SubScheduleCards({
  index,
  control,
  register,
}: {
  index: number;
  control: ScheduleControl;
  register: UseFormRegister<ScheduleFormInput>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `schedules.${index}.sub_schedules`,
  });

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, si) => (
        <div key={field.id} className="rounded-2xl border border-border/70 bg-muted/30 p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-sm font-semibold">Sub-subject {si + 1}</p>
            <button
              type="button"
              aria-label="Remove sub-subject"
              onClick={() => remove(si)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <ControlledSelectField
              control={control}
              name={`schedules.${index}.sub_schedules.${si}.subject_type`}
              label="Type"
              options={SUB_SUBJECT_TYPES}
            />
            <MobileTextField
              label="Name"
              placeholder="e.g. Physics Practical"
              {...register(`schedules.${index}.sub_schedules.${si}.subject_name`)}
            />
            <MobileTextField
              label="Date"
              type="date"
              {...register(`schedules.${index}.sub_schedules.${si}.exam_date`)}
            />
            <FieldRow>
              <MobileTextField
                label="Start"
                type="time"
                {...register(`schedules.${index}.sub_schedules.${si}.start_time`)}
              />
              <MobileTextField
                label="End"
                type="time"
                {...register(`schedules.${index}.sub_schedules.${si}.end_time`)}
              />
            </FieldRow>
            <FieldRow>
              <MobileTextField
                label="Max marks"
                type="number"
                inputMode="numeric"
                {...register(`schedules.${index}.sub_schedules.${si}.exam_marks`)}
              />
              <MobileTextField
                label="Pass marks"
                type="number"
                inputMode="numeric"
                {...register(`schedules.${index}.sub_schedules.${si}.passing_marks`)}
              />
            </FieldRow>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            subject_type: "PRACTICAL_EXAM",
            subject_name: "",
            exam_date: "",
            start_time: "",
            end_time: "",
            exam_marks: 30,
            passing_marks: 10,
          })
        }
      >
        <Plus size={16} /> {SCHEDULE_PAGE.buttons.addSubSchedule}
      </Button>
    </div>
  );
}

function QuickFillSheet({
  isOpen,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (field: "exam_date" | "start_time" | "end_time" | "exam_marks" | "passing_marks", value: string | number) => void;
}) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [marks, setMarks] = useState("");
  const [passing, setPassing] = useState("");

  function apply() {
    if (date) onApply("exam_date", date);
    if (start) onApply("start_time", start);
    if (end) onApply("end_time", end);
    if (marks) onApply("exam_marks", Number(marks));
    if (passing) onApply("passing_marks", Number(passing));
    onClose();
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick fill"
      footer={
        <Button type="button" size="lg" className="w-full" onClick={apply}>
          Apply to all subjects
        </Button>
      }
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Fill only what is common — empty fields are left unchanged.
      </p>
      <div className="flex flex-col gap-3 pb-2">
        <MobileTextField label={SCHEDULE_PAGE.bulk.date} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <FieldRow>
          <MobileTextField label={SCHEDULE_PAGE.bulk.startTime} type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          <MobileTextField label={SCHEDULE_PAGE.bulk.endTime} type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </FieldRow>
        <FieldRow>
          <MobileTextField label={SCHEDULE_PAGE.bulk.marks} type="number" inputMode="numeric" value={marks} onChange={(e) => setMarks(e.target.value)} />
          <MobileTextField label={SCHEDULE_PAGE.bulk.passing} type="number" inputMode="numeric" value={passing} onChange={(e) => setPassing(e.target.value)} />
        </FieldRow>
      </div>
    </BottomSheet>
  );
}

/**
 * Phone layout for creating an exam schedule: exam setup, a Quick fill sheet
 * for common dates / times, one expandable card per subject, and a pinned
 * Save bar. Uses the same `useExamScheduleForm` state as desktop.
 */
export function ExamScheduleCreateMobile() {
  const router = useRouter();
  const {
    form,
    schedulesField,
    isSubmitting,
    isLoadingSubjects,
    onSubmit,
    addScheduleRow,
    loadAllSubjects,
    applyToAll,
  } = useExamScheduleForm();
  const { control, register, watch, setValue, formState } = form;
  const errors = formState.errors;

  const yearId = watch("academic_year_id");
  const classIds = watch("class_ids") ?? [];
  const { years, classes, setSelectedAcademicYearId } = useAcademicClassSection({
    autoSelectCurrentYear: true,
  });
  const { exams } = useExams(yearId ? { academic_year_id: yearId } : {});
  const { details: hallRooms } = useHallDetails();

  const [quickFillOpen, setQuickFillOpen] = useState(false);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const currentYear = useMemo(() => years?.find((y) => y.is_current), [years]);
  useEffect(() => {
    if (currentYear && !yearId) {
      setValue("academic_year_id", currentYear.id);
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, yearId, setValue, setSelectedAcademicYearId]);

  const uniqueExams = useMemo(() => {
    const seen = new Set<string>();
    return exams.filter((e) => {
      if (seen.has(e.exam_name)) return false;
      seen.add(e.exam_name);
      return true;
    });
  }, [exams]);

  const canLoadSubjects = classIds.length > 0;
  const rowCount = schedulesField.fields.length;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 pt-3">
      <StepHeader
        icon={<Zap size={22} />}
        title="Create exam schedule"
        description="Set up the exam, then add every subject's date and time."
      />

      <FormGroup title="Exam">
        <MobileSelectField
          label={SCHEDULE_PAGE.labels.academicYear}
          required
          value={yearId ?? ""}
          placeholder="Select year"
          error={errors.academic_year_id?.message}
          options={years.map((y) => ({
            value: y.id,
            label: `${y.name}${y.is_current ? " (Current)" : ""}`,
          }))}
          onChange={(value) => {
            setValue("academic_year_id", value, { shouldValidate: true });
            setValue("class_ids", []);
            setValue("exam_id", "");
            setSelectedAcademicYearId(value);
          }}
        />
        <MobileMultiSelectField
          label={SCHEDULE_PAGE.labels.class}
          required
          disabled={!yearId}
          value={classIds}
          placeholder={yearId ? "Select class(es)" : "Choose a year first"}
          error={(errors.class_ids as { message?: string } | undefined)?.message}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(ids) => setValue("class_ids", ids, { shouldValidate: true })}
        />
        <ControlledSelectField
          control={control}
          name="exam_id"
          label={SCHEDULE_PAGE.labels.exam}
          required
          disabled={!canLoadSubjects}
          placeholder={canLoadSubjects ? "Select exam" : "Choose classes first"}
          options={uniqueExams.map((e) => ({ value: e.id, label: e.exam_name }))}
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!canLoadSubjects}
          loading={isLoadingSubjects}
          onClick={() => void loadAllSubjects()}
        >
          <Wand2 size={18} /> {SCHEDULE_PAGE.buttons.loadSubjects}
        </Button>
      </FormGroup>

      <FormGroup
        title={`Subjects (${rowCount})`}
        description="Tap a subject to edit its date, time and marks."
      >
        <Button
          type="button"
          variant="outline"
          disabled={rowCount === 0}
          onClick={() => setQuickFillOpen(true)}
        >
          <Zap size={16} /> {SCHEDULE_PAGE.bulk.sectionTitle}
        </Button>

        {schedulesField.fields.map((field, i) => {
          const rowErrors = errors.schedules?.[i];
          const hasError = Boolean(rowErrors);
          const open = hasError || Boolean(openRows[field.id]);
          const name = watch(`schedules.${i}.subject_name`) || `Subject ${i + 1}`;
          const date = watch(`schedules.${i}.exam_date`);
          const start = watch(`schedules.${i}.start_time`);
          const marks = watch(`schedules.${i}.exam_marks`);
          const summary = [date, start, marks ? `${marks} marks` : null]
            .filter(Boolean)
            .join(" · ");
          const subEnabled = watch(`schedules.${i}.sub_subject_enabled`);
          const hasSubject = Boolean(watch(`schedules.${i}.subject_id`));

          return (
            <section
              key={field.id}
              data-invalid={hasError ? "true" : undefined}
              className={`overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900 ${
                hasError ? "border-destructive" : "border-border/70"
              }`}
            >
              <div className="flex items-center">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenRows((p) => ({ ...p, [field.id]: !open }))}
                  className="flex min-h-16 min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left active:bg-muted/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {summary || "Not scheduled yet"}
                    </span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {rowCount > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={() => schedulesField.remove(i)}
                    className="mr-1 flex h-12 w-12 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {open && (
                <div className="flex flex-col gap-3 border-t border-border/50 p-4">
                  <MobileTextField
                    label={SCHEDULE_PAGE.labels.subject}
                    required
                    placeholder="Subject name"
                    readOnly={hasSubject}
                    error={rowErrors?.subject_id?.message ?? rowErrors?.subject_name?.message}
                    {...register(`schedules.${i}.subject_name`)}
                  />
                  <ControlledSelectField
                    control={control}
                    name={`schedules.${i}.subject_type`}
                    label={SCHEDULE_PAGE.labels.subjectType}
                    options={SUBJECT_TYPE_OPTIONS}
                  />
                  <MobileTextField
                    label={SCHEDULE_PAGE.labels.examDate}
                    type="date"
                    required
                    error={rowErrors?.exam_date?.message}
                    {...register(`schedules.${i}.exam_date`)}
                  />
                  <FieldRow>
                    <MobileTextField
                      label={SCHEDULE_PAGE.labels.startTime}
                      type="time"
                      required
                      error={rowErrors?.start_time?.message}
                      {...register(`schedules.${i}.start_time`)}
                    />
                    <MobileTextField
                      label={SCHEDULE_PAGE.labels.endTime}
                      type="time"
                      required
                      error={rowErrors?.end_time?.message}
                      {...register(`schedules.${i}.end_time`)}
                    />
                  </FieldRow>
                  <FieldRow>
                    <MobileTextField
                      label={SCHEDULE_PAGE.labels.examMarks}
                      type="number"
                      inputMode="numeric"
                      required
                      {...register(`schedules.${i}.exam_marks`)}
                    />
                    <MobileTextField
                      label={SCHEDULE_PAGE.labels.passingMarks}
                      type="number"
                      inputMode="numeric"
                      required
                      {...register(`schedules.${i}.passing_marks`)}
                    />
                  </FieldRow>
                  <ControlledSelectField
                    control={control}
                    name={`schedules.${i}.hall_detail_id`}
                    label={SCHEDULE_PAGE.labels.room}
                    placeholder="Select room"
                    options={hallRooms.map((r) => ({ value: r.id, label: r.room_name }))}
                  />
                  <ControlledToggleRow
                    control={control}
                    name={`schedules.${i}.sub_subject_enabled`}
                    label={SCHEDULE_PAGE.labels.subSubjectEnabled}
                  />
                  {subEnabled && (
                    <SubScheduleCards index={i} control={control} register={register} />
                  )}
                </div>
              )}
            </section>
          );
        })}

        <Button type="button" variant="outline" size="lg" onClick={addScheduleRow}>
          <Plus size={18} /> {SCHEDULE_PAGE.buttons.addRow}
        </Button>
      </FormGroup>

      <StickyActionBar>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => router.push(EXAM_ROUTES.schedule.list)}
        >
          {SCHEDULE_PAGE.buttons.cancel}
        </Button>
        <Button type="submit" size="lg" className="flex-[2]" loading={isSubmitting}>
          {SCHEDULE_PAGE.buttons.save}
        </Button>
      </StickyActionBar>

      <QuickFillSheet
        isOpen={quickFillOpen}
        onClose={() => setQuickFillOpen(false)}
        onApply={applyToAll}
      />
    </form>
  );
}
