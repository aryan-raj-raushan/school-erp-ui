"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useFieldArray, Controller } from "react-hook-form";
import { useState } from "react";
import { useExamScheduleForm } from "@/hooks/exam/useExamSchedule";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useHallPlans, useHallDetails } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H3,
  P,
  Button,
  Spinner,
  FormField,
  Input,
  Select,
} from "@/components/ui";
import {
  SCHEDULE_PAGE,
  EXAM_ROUTES,
  SUBJECT_TYPE_OPTIONS,
} from "@/constants/exam.constants";

function SubScheduleRows({
  nestIndex,
  control,
  register,
  errors,
  isReadOnly,
}: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `schedules.${nestIndex}.sub_schedules`,
  });

  return (
    <Div type="col" gap="sm" className="pl-4 border-l-2 border-border mt-3">
      {fields.map((field, si) => (
        <Div key={field.id} variant="glass-sm" className="p-3">
          <Div type="row" justify="between" align="center" className="mb-3">
            <P className="text-xs font-semibold text-muted-foreground">
              Sub-Subject {si + 1}
            </P>
            {!isReadOnly && (
              <Button
                size="icon-xs"
                variant="destructive"
                type="button"
                onClick={() => remove(si)}
              >
                <Trash2 size={12} />
              </Button>
            )}
          </Div>
          <Div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FormField label="Type">
              <Select
                {...register(
                  `schedules.${nestIndex}.sub_schedules.${si}.subject_type`,
                )}
                disabled={isReadOnly}
              >
                {SUBJECT_TYPE_OPTIONS.filter(
                  (o) => o.value !== "MAIN_EXAM",
                ).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Sub-Subject Name">
              <Input
                {...register(
                  `schedules.${nestIndex}.sub_schedules.${si}.subject_name`,
                )}
                placeholder="e.g. Physics Practical"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Date">
              <Input
                {...register(
                  `schedules.${nestIndex}.sub_schedules.${si}.exam_date`,
                )}
                type="date"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Start Time">
              <Input
                {...register(
                  `schedules.${nestIndex}.sub_schedules.${si}.start_time`,
                )}
                type="time"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="End Time">
              <Input
                {...register(
                  `schedules.${nestIndex}.sub_schedules.${si}.end_time`,
                )}
                type="time"
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Max Marks">
              <Input
                {...register(
                  `schedules.${nestIndex}.sub_schedules.${si}.exam_marks`,
                )}
                type="number"
                min={0}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Pass Marks">
              <Input
                {...register(
                  `schedules.${nestIndex}.sub_schedules.${si}.passing_marks`,
                )}
                type="number"
                min={0}
                disabled={isReadOnly}
              />
            </FormField>
          </Div>
        </Div>
      ))}
      {!isReadOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
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
          <Plus size={13} /> {SCHEDULE_PAGE.buttons.addSubSchedule}
        </Button>
      )}
    </Div>
  );
}

function ScheduleCreateContent() {
  const router = useRouter();
  const { form, schedulesField, isSubmitting, onSubmit, addScheduleRow } =
    useExamScheduleForm();
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

  const {
    years,
    classes,
    // currentYear,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    handleClassChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const { exams } = useExams(
    watchedYearId
      ? { academic_year_id: watchedYearId, class_id: watchedClassId }
      : {},
  );
  const { plans } = useHallPlans();
  const { details: hallRooms } = useHallDetails();

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const currentYear = useMemo(
    () => years?.find((year) => year.is_current),
    [years],
  );
  useEffect(() => {
    if (currentYear && !watchedYearId) {
      setValue("academic_year_id", currentYear.id);
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, watchedYearId, setValue, setSelectedAcademicYearId]);

  function toggleRow(i: number) {
    setExpandedRows((p) => ({ ...p, [i]: !p[i] }));
  }

  return (
    <Div type="col" gap="lg" className="max-w-5xl">
      <PageHeader
        title="Create Exam Schedule"
        subtitle="Bulk add all subject schedules for an exam"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(EXAM_ROUTES.schedule.list)}
          >
            <ArrowLeft size={14} /> {SCHEDULE_PAGE.buttons.cancel}
          </Button>
        }
      />

      <form onSubmit={onSubmit}>
        <Div type="col" gap="md">
          {/* Header selectors */}
          <Div variant="card" className="p-5">
            <Div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                label={SCHEDULE_PAGE.labels.academicYear + " *"}
                error={errors.academic_year_id?.message}
              >
                <Select
                  {...register("academic_year_id")}
                  onChange={(e) => {
                    setValue("academic_year_id", e.target.value);
                    setValue("class_id", "");
                    setValue("exam_id", "");
                    setSelectedAcademicYearId(e.target.value);
                    handleClassChange("");
                  }}
                >
                  <option value="">Select year</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                      {y.is_current ? " (Current)" : ""}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={SCHEDULE_PAGE.labels.exam + " *"}
                error={errors.exam_id?.message}
              >
                <Select
                  {...register("class_id")}
                  disabled={!watchedYearId}
                  onChange={(e) => {
                    setValue("class_id", e.target.value);
                    setValue("exam_id", "");
                    handleClassChange(e.target.value);
                  }}
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={SCHEDULE_PAGE.labels.exam + " *"}
                error={errors.exam_id?.message}
              >
                <Select {...register("exam_id")} disabled={!watchedClassId}>
                  <option value="">Select exam</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.exam_name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </Div>
          </Div>

          {/* Schedule rows */}
          <Div type="col" gap="sm">
            {schedulesField.fields.map((field, i) => {
              const subEnabled = watch(`schedules.${i}.sub_subject_enabled`);
              const expanded = expandedRows[i] !== false;
              return (
                <Div key={field.id} variant="card" className="overflow-hidden">
                  {/* Row header */}
                  <Div
                    type="row"
                    align="center"
                    justify="between"
                    className="px-4 py-3 border-b border-border bg-muted/30"
                  >
                    <H3 color="default">Subject {i + 1}</H3>
                    <Div type="row" gap="xs">
                      <Button
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                        onClick={() => toggleRow(i)}
                      >
                        {expanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </Button>
                      {schedulesField.fields.length > 1 && (
                        <Button
                          size="icon-xs"
                          type="button"
                          variant="destructive"
                          onClick={() => schedulesField.remove(i)}
                        >
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
                            (errors.schedules?.[i] as any)?.subject_name
                              ?.message
                          }
                        >
                          <Input
                            {...register(`schedules.${i}.subject_name`)}
                            placeholder="Subject name"
                          />
                        </FormField>
                        <FormField label={SCHEDULE_PAGE.labels.subjectType}>
                          <Select {...register(`schedules.${i}.subject_type`)}>
                            {SUBJECT_TYPE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </Select>
                        </FormField>
                        <FormField
                          label={SCHEDULE_PAGE.labels.examDate + " *"}
                          error={
                            (errors.schedules?.[i] as any)?.exam_date?.message
                          }
                        >
                          <Input
                            {...register(`schedules.${i}.exam_date`)}
                            type="date"
                          />
                        </FormField>
                        <FormField
                          label={SCHEDULE_PAGE.labels.startTime + " *"}
                          error={
                            (errors.schedules?.[i] as any)?.start_time?.message
                          }
                        >
                          <Input
                            {...register(`schedules.${i}.start_time`)}
                            type="time"
                          />
                        </FormField>
                        <FormField
                          label={SCHEDULE_PAGE.labels.endTime + " *"}
                          error={
                            (errors.schedules?.[i] as any)?.end_time?.message
                          }
                        >
                          <Input
                            {...register(`schedules.${i}.end_time`)}
                            type="time"
                          />
                        </FormField>
                        <FormField
                          label={SCHEDULE_PAGE.labels.examMarks + " *"}
                        >
                          <Input
                            {...register(`schedules.${i}.exam_marks`)}
                            type="number"
                            min={0}
                          />
                        </FormField>
                        <FormField
                          label={SCHEDULE_PAGE.labels.passingMarks + " *"}
                        >
                          <Input
                            {...register(`schedules.${i}.passing_marks`)}
                            type="number"
                            min={0}
                          />
                        </FormField>
                        <FormField label={SCHEDULE_PAGE.labels.room}>
                          <Select
                            {...register(`schedules.${i}.hall_detail_id`)}
                          >
                            <option value="">Select room</option>
                            {hallRooms.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.room_name}
                              </option>
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
                        <label
                          htmlFor={`sub_${i}`}
                          className="text-sm text-foreground"
                        >
                          {SCHEDULE_PAGE.labels.subSubjectEnabled}
                        </label>
                      </Div>

                      {subEnabled && (
                        <SubScheduleRows
                          nestIndex={i}
                          control={control}
                          register={register}
                          errors={errors}
                          isReadOnly={false}
                        />
                      )}
                    </Div>
                  )}
                </Div>
              );
            })}
          </Div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={addScheduleRow}
          >
            <Plus size={14} /> {SCHEDULE_PAGE.buttons.addRow}
          </Button>

          <Div type="row" gap="md" className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(EXAM_ROUTES.schedule.list)}
            >
              {SCHEDULE_PAGE.buttons.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {SCHEDULE_PAGE.buttons.save}
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
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
