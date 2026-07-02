"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, BookOpen, Wand2, Copy, CheckSquare, Square } from "lucide-react";
import { useFieldArray, Controller } from "react-hook-form";
import { useExamScheduleForm } from "@/hooks/exam/useExamSchedule";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H3,
  P,
  Span,
  Button,
  Spinner,
  FormField,
  Input,
  Select,
  Modal,
  ModalBody,
  ModalFooter,
} from "@/components/ui";
import {
  SCHEDULE_PAGE,
  EXAM_ROUTES,
  SUBJECT_TYPE_OPTIONS,
} from "@/constants/exam.constants";

// ── Sub-schedule rows (unchanged) ─────────────────────────────────────────────

function SubScheduleRows({ nestIndex, control, register, isReadOnly }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `schedules.${nestIndex}.sub_schedules`,
  });

  return (
    <Div type="col" gap="sm" className="pl-4 border-l-2 border-border mt-3">
      {fields.map((field, si) => (
        <Div key={field.id} variant="glass-sm" className="p-3">
          <Div type="row" justify="between" align="center" className="mb-3">
            <P className="text-xs font-semibold text-muted-foreground">Sub-Subject {si + 1}</P>
            {!isReadOnly && (
              <Button size="icon-xs" variant="destructive" type="button" onClick={() => remove(si)}>
                <Trash2 size={12} />
              </Button>
            )}
          </Div>
          <Div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FormField label="Type">
              <Select {...register(`schedules.${nestIndex}.sub_schedules.${si}.subject_type`)} disabled={isReadOnly}>
                {SUBJECT_TYPE_OPTIONS.filter((o) => o.value !== "MAIN_EXAM").map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Sub-Subject Name">
              <Input {...register(`schedules.${nestIndex}.sub_schedules.${si}.subject_name`)} placeholder="e.g. Physics Practical" disabled={isReadOnly} />
            </FormField>
            <FormField label="Date">
              <Input {...register(`schedules.${nestIndex}.sub_schedules.${si}.exam_date`)} type="date" disabled={isReadOnly} />
            </FormField>
            <FormField label="Start Time">
              <Input {...register(`schedules.${nestIndex}.sub_schedules.${si}.start_time`)} type="time" disabled={isReadOnly} />
            </FormField>
            <FormField label="End Time">
              <Input {...register(`schedules.${nestIndex}.sub_schedules.${si}.end_time`)} type="time" disabled={isReadOnly} />
            </FormField>
            <FormField label="Max Marks">
              <Input {...register(`schedules.${nestIndex}.sub_schedules.${si}.exam_marks`)} type="number" min={0} disabled={isReadOnly} />
            </FormField>
            <FormField label="Pass Marks">
              <Input {...register(`schedules.${nestIndex}.sub_schedules.${si}.passing_marks`)} type="number" min={0} disabled={isReadOnly} />
            </FormField>
          </Div>
        </Div>
      ))}
      {!isReadOnly && (
        <Button
          type="button" variant="outline" size="sm" className="w-fit"
          onClick={() => append({ subject_type: "PRACTICAL_EXAM", subject_name: "", exam_date: "", start_time: "", end_time: "", exam_marks: 30, passing_marks: 10 })}
        >
          <Plus size={13} /> {SCHEDULE_PAGE.buttons.addSubSchedule}
        </Button>
      )}
    </Div>
  );
}

// ── Right panel: live schedule summary ───────────────────────────────────────

function ScheduleSummary({ schedules }: { schedules: any[] }) {
  const filled = schedules.filter((s) => s.subject_name);
  return (
    <Div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Div type="row" align="center" gap="sm" className="px-4 py-3 border-b border-border bg-muted/40">
        <BookOpen size={14} className="text-muted-foreground" />
        <Span className="text-sm font-semibold">{SCHEDULE_PAGE.summary.title}</Span>
        {filled.length > 0 && (
          <Span className="ml-auto text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
            {filled.length} {SCHEDULE_PAGE.summary.subjectsLabel}
          </Span>
        )}
      </Div>
      <Div className="divide-y divide-border max-h-[calc(100vh-220px)] overflow-y-auto">
        {filled.length === 0 ? (
          <P className="text-[12px] text-muted-foreground text-center py-8 px-4">
            {SCHEDULE_PAGE.summary.empty}
          </P>
        ) : (
          filled.map((s, i) => (
            <Div key={i} className="px-4 py-2.5">
              <P className="text-[12px] font-semibold text-foreground truncate">{s.subject_name || `Subject ${i + 1}`}</P>
              <Div type="row" align="center" gap="sm" className="mt-0.5 flex-wrap">
                {s.exam_date && (
                  <Span className="text-[10px] text-muted-foreground">{s.exam_date}</Span>
                )}
                {s.start_time && s.end_time && (
                  <Span className="text-[10px] text-muted-foreground">{s.start_time}–{s.end_time}</Span>
                )}
                {s.exam_marks > 0 && (
                  <Span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {s.exam_marks} marks
                  </Span>
                )}
              </Div>
            </Div>
          ))
        )}
      </Div>
    </Div>
  );
}

// ── Bulk-apply strip ─────────────────────────────────────────────────────────

function BulkApplyStrip({ onApply, disabled }: { onApply: (f: string, v: any) => void; disabled: boolean }) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [marks, setMarks] = useState("");
  const [passing, setPassing] = useState("");

  return (
    <Div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3">
      <P className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {SCHEDULE_PAGE.bulk.sectionTitle} — {SCHEDULE_PAGE.buttons.applyToAll}
      </P>
      <Div type="row" align="end" className="flex-wrap gap-2">
        <Div type="col" gap="xs">
          <label className="text-[10px] text-muted-foreground">{SCHEDULE_PAGE.bulk.date}</label>
          <input
            type="date"
            value={date}
            disabled={disabled}
            onChange={(e) => setDate(e.target.value)}
            className="h-7 text-xs px-2 rounded border border-border bg-background disabled:opacity-50"
          />
        </Div>
        <Div type="col" gap="xs">
          <label className="text-[10px] text-muted-foreground">{SCHEDULE_PAGE.bulk.startTime}</label>
          <input
            type="time"
            value={start}
            disabled={disabled}
            onChange={(e) => setStart(e.target.value)}
            className="h-7 text-xs px-2 rounded border border-border bg-background disabled:opacity-50"
          />
        </Div>
        <Div type="col" gap="xs">
          <label className="text-[10px] text-muted-foreground">{SCHEDULE_PAGE.bulk.endTime}</label>
          <input
            type="time"
            value={end}
            disabled={disabled}
            onChange={(e) => setEnd(e.target.value)}
            className="h-7 text-xs px-2 rounded border border-border bg-background disabled:opacity-50"
          />
        </Div>
        <Div type="col" gap="xs">
          <label className="text-[10px] text-muted-foreground">{SCHEDULE_PAGE.bulk.marks}</label>
          <input
            type="number"
            value={marks}
            min={0}
            disabled={disabled}
            onChange={(e) => setMarks(e.target.value)}
            className="h-7 text-xs px-2 rounded border border-border bg-background w-20 disabled:opacity-50"
          />
        </Div>
        <Div type="col" gap="xs">
          <label className="text-[10px] text-muted-foreground">{SCHEDULE_PAGE.bulk.passing}</label>
          <input
            type="number"
            value={passing}
            min={0}
            disabled={disabled}
            onChange={(e) => setPassing(e.target.value)}
            className="h-7 text-xs px-2 rounded border border-border bg-background w-20 disabled:opacity-50"
          />
        </Div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          className="h-7 text-xs"
          onClick={() => {
            if (date) onApply("exam_date", date);
            if (start) onApply("start_time", start);
            if (end) onApply("end_time", end);
            if (marks) onApply("exam_marks", Number(marks));
            if (passing) onApply("passing_marks", Number(passing));
          }}
        >
          {SCHEDULE_PAGE.buttons.applyToAll}
        </Button>
      </Div>
    </Div>
  );
}

// ── Sibling Copy Modal ────────────────────────────────────────────────────────

function SiblingCopyModal({
  siblings,
  isCopying,
  onCopy,
  onDismiss,
}: {
  siblings: { classId: string; className?: string }[];
  isCopying: boolean;
  onCopy: (ids: string[]) => void;
  onDismiss: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(siblings.map((s) => s.classId));

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <Modal title="Copy schedule to other classes?" onClose={onDismiss} size="sm">
      <ModalBody>
        <P className="text-sm text-muted-foreground mb-4">
          This exam covers other classes too. Apply the same dates, times and marks to:
        </P>
        <Div type="col" gap="sm">
          {siblings.map((s) => {
            const checked = selected.includes(s.classId);
            return (
              <Button
                key={s.classId}
                type="button"
                variant="outline"
                onClick={() => toggle(s.classId)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left justify-start"
              >
                {checked ? (
                  <CheckSquare size={14} className="text-primary shrink-0" />
                ) : (
                  <Square size={14} className="text-muted-foreground shrink-0" />
                )}
                <Span className="text-sm">{s.className ?? s.classId}</Span>
              </Button>
            );
          })}
        </Div>
        <P className="text-xs text-muted-foreground mt-3">
          Subjects are matched by name — mismatches are skipped.
        </P>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onDismiss}>
          Skip
        </Button>
        <Button
          size="sm"
          loading={isCopying}
          disabled={selected.length === 0}
          onClick={() => onCopy(selected)}
        >
          <Copy size={13} /> Copy to {selected.length} class{selected.length !== 1 ? "es" : ""}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function ScheduleCreateContent() {
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
    pendingSiblings,
    isCopyingToSiblings,
    copyToSiblings,
    dismissSiblingCopy,
  } = useExamScheduleForm();

  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const watchedYearId = watch("academic_year_id");
  const watchedClassId = watch("class_id");
  const watchedExamId = watch("exam_id");
  const watchedSchedules = watch("schedules");

  const {
    years,
    classes,
    sections,
    setSelectedAcademicYearId,
    handleClassChange,
    handleSectionChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const { exams } = useExams(
    watchedYearId ? { academic_year_id: watchedYearId, class_id: watchedClassId } : {},
  );
  const { details: hallRooms } = useHallDetails();

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // Deduplicate exams by exam_name to avoid duplicates when created with multiple classes
  const deduplicatedExams = useMemo(() => {
    const seen = new Set<string>();
    return exams.filter((e) => {
      if (seen.has(e.exam_name)) return false;
      seen.add(e.exam_name);
      return true;
    });
  }, [exams]);

  const currentYear = useMemo(() => years?.find((year) => year.is_current), [years]);
  useEffect(() => {
    if (currentYear && !watchedYearId) {
      setValue("academic_year_id", currentYear.id);
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, watchedYearId, setValue, setSelectedAcademicYearId]);

  function toggleRow(i: number) {
    setExpandedRows((p) => ({ ...p, [i]: !p[i] }));
  }

  const canLoadSubjects = !!watchedClassId;

  // Build class name map for sibling copy modal
  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  return (
    <>
    {pendingSiblings.length > 0 && (
      <SiblingCopyModal
        siblings={pendingSiblings.map((s) => ({ classId: s.classId, className: classNameById[s.classId] }))}
        isCopying={isCopyingToSiblings}
        onCopy={copyToSiblings}
        onDismiss={dismissSiblingCopy}
      />
    )}
    <Div type="row" align="start" gap="lg">
      {/* ── Left: form ────────────────────────────────────────────────────── */}
      <Div className="flex-1 min-w-0">
        <form onSubmit={onSubmit}>
          <Div type="col" gap="md">
            <PageHeader
              title="Create Exam Schedule"
              subtitle="Bulk add all subject schedules for an exam"
              actions={
                <Button variant="outline" size="sm" onClick={() => router.push(EXAM_ROUTES.schedule.list)}>
                  <ArrowLeft size={14} /> {SCHEDULE_PAGE.buttons.cancel}
                </Button>
              }
            />

            {/* Header selectors */}
            <Div variant="card" className="p-5">
              <Div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label={SCHEDULE_PAGE.labels.academicYear + " *"} error={errors.academic_year_id?.message}>
                  <Select
                    {...register("academic_year_id")}
                    onChange={(e) => {
                      setValue("academic_year_id", e.target.value);
                      setValue("class_id", "");
                      setValue("section_id", "");
                      setValue("exam_id", "");
                      setSelectedAcademicYearId(e.target.value);
                      handleClassChange("");
                    }}
                  >
                    <option value="">Select year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}{y.is_current ? " (Current)" : ""}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={SCHEDULE_PAGE.labels.class + " *"} error={errors.class_id?.message}>
                  <Select
                    {...register("class_id")}
                    disabled={!watchedYearId}
                    onChange={(e) => {
                      setValue("class_id", e.target.value);
                      setValue("section_id", "");
                      setValue("exam_id", "");
                      handleClassChange(e.target.value);
                      handleSectionChange("");
                    }}
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={SCHEDULE_PAGE.labels.section}>
                  <Select
                    {...register("section_id")}
                    disabled={!watchedClassId}
                    onChange={(e) => {
                      setValue("section_id", e.target.value);
                      handleSectionChange(e.target.value);
                    }}
                  >
                    <option value="">All sections</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={SCHEDULE_PAGE.labels.exam + " *"} error={errors.exam_id?.message}>
                  <Select {...register("exam_id")} disabled={!watchedClassId}>
                    <option value="">Select exam</option>
                    {deduplicatedExams.map((e) => (
                      <option key={e.id} value={e.id}>{e.exam_name}</option>
                    ))}
                  </Select>
                </FormField>
              </Div>

              {/* Load All Subjects button */}
              <Div type="row" align="center" gap="sm" className="mt-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!canLoadSubjects || isLoadingSubjects}
                  loading={isLoadingSubjects}
                  onClick={() => loadAllSubjects()}
                >
                  <Wand2 size={13} />
                  {SCHEDULE_PAGE.buttons.loadSubjects}
                </Button>
                <P className="text-[11px] text-muted-foreground">
                  Auto-fills all class subjects — then just set dates & times
                </P>
              </Div>
            </Div>

            {/* Bulk-apply strip */}
            <BulkApplyStrip
              disabled={!watchedExamId || schedulesField.fields.length === 0}
              onApply={(field, value) => applyToAll(field as any, value)}
            />

            {/* Schedule rows */}
            <Div type="col" gap="sm">
              {schedulesField.fields.map((field, i) => {
                const subEnabled = watch(`schedules.${i}.sub_subject_enabled`);
                const expanded = expandedRows[i] !== false;
                return (
                  <Div key={field.id} variant="card" className="overflow-hidden">
                    <Div
                      type="row" align="center" justify="between"
                      className="px-4 py-3 border-b border-border bg-muted/30"
                    >
                      <H3 color="default">
                        {watch(`schedules.${i}.subject_name`) || `Subject ${i + 1}`}
                      </H3>
                      <Div type="row" gap="xs">
                        <Button size="icon-xs" type="button" variant="ghost" onClick={() => toggleRow(i)}>
                          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                        {schedulesField.fields.length > 1 && (
                          <Button size="icon-xs" type="button" variant="destructive" onClick={() => schedulesField.remove(i)}>
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </Div>
                    </Div>

                    {expanded && (
                      <Div className="p-4">
                        <Div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            label={SCHEDULE_PAGE.labels.subject + " *"}
                            error={
                              (errors.schedules?.[i] as any)?.subject_id?.message ??
                              (errors.schedules?.[i] as any)?.subject_name?.message
                            }
                          >
                            {/* Show subject name as read-only text if loaded via loadAllSubjects, or a manual input */}
                            <Input
                              {...register(`schedules.${i}.subject_name`)}
                              placeholder="Subject name"
                              readOnly={!!watch(`schedules.${i}.subject_id`)}
                              className={watch(`schedules.${i}.subject_id`) ? "bg-muted/30 cursor-default" : ""}
                            />
                          </FormField>
                          <FormField label={SCHEDULE_PAGE.labels.subjectType}>
                            <Select {...register(`schedules.${i}.subject_type`)}>
                              {SUBJECT_TYPE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </Select>
                          </FormField>
                          <FormField label={SCHEDULE_PAGE.labels.examDate + " *"} error={(errors.schedules?.[i] as any)?.exam_date?.message}>
                            <Input {...register(`schedules.${i}.exam_date`)} type="date" />
                          </FormField>
                          <FormField label={SCHEDULE_PAGE.labels.startTime + " *"} error={(errors.schedules?.[i] as any)?.start_time?.message}>
                            <Input {...register(`schedules.${i}.start_time`)} type="time" />
                          </FormField>
                          <FormField label={SCHEDULE_PAGE.labels.endTime + " *"} error={(errors.schedules?.[i] as any)?.end_time?.message}>
                            <Input {...register(`schedules.${i}.end_time`)} type="time" />
                          </FormField>
                          <FormField label={SCHEDULE_PAGE.labels.examMarks + " *"}>
                            <Input {...register(`schedules.${i}.exam_marks`)} type="number" min={0} />
                          </FormField>
                          <FormField label={SCHEDULE_PAGE.labels.passingMarks + " *"}>
                            <Input {...register(`schedules.${i}.passing_marks`)} type="number" min={0} />
                          </FormField>
                          <FormField label={SCHEDULE_PAGE.labels.room}>
                            <Select {...register(`schedules.${i}.hall_detail_id`)}>
                              <option value="">Select room</option>
                              {hallRooms.map((r) => (
                                <option key={r.id} value={r.id}>{r.room_name}</option>
                              ))}
                            </Select>
                          </FormField>
                        </Div>

                        <Div type="row" align="center" gap="sm" className="mt-3">
                          <Controller
                            control={control}
                            name={`schedules.${i}.sub_subject_enabled`}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                id={`sub_${i}`}
                                checked={field.value ?? false}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-border"
                              />
                            )}
                          />
                          <label htmlFor={`sub_${i}`} className="text-sm text-foreground">
                            {SCHEDULE_PAGE.labels.subSubjectEnabled}
                          </label>
                        </Div>

                        {subEnabled && (
                          <SubScheduleRows
                            nestIndex={i}
                            control={control}
                            register={register}
                            isReadOnly={false}
                          />
                        )}
                      </Div>
                    )}
                  </Div>
                );
              })}
            </Div>

            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addScheduleRow}>
              <Plus size={14} /> {SCHEDULE_PAGE.buttons.addRow}
            </Button>

            <Div type="row" gap="md" className="pt-2">
              <Button type="button" variant="outline" onClick={() => router.push(EXAM_ROUTES.schedule.list)}>
                {SCHEDULE_PAGE.buttons.cancel}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {SCHEDULE_PAGE.buttons.save}
              </Button>
            </Div>
          </Div>
        </form>
      </Div>

      {/* ── Right: summary panel ───────────────────────────────────────────── */}
      <Div className="w-64 xl:w-72 shrink-0 sticky top-4 hidden lg:block">
        <ScheduleSummary schedules={watchedSchedules ?? []} />
      </Div>
    </Div>
    </>
  );
}

export default function ScheduleSlugPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ScheduleCreateContent />
    </Suspense>
  );
}
