"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Controller } from "react-hook-form";
import { useExamScheduleEdit } from "@/hooks/exam/useExamSchedule";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
  Spinner,
  FormField,
  Input,
  Select,
  Badge,
} from "@/components/ui";
import {
  SCHEDULE_PAGE,
  EXAM_ROUTES,
  SUBJECT_TYPE_OPTIONS,
} from "@/constants/exam.constants";

function ScheduleViewContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const isEdit = params.get("edit") === "true";

  const { form, schedule, subSchedules, isLoading, isSubmitting, onSubmit } =
    useExamScheduleEdit(id);
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const { details: hallRooms } = useHallDetails();

  // load names for year / class / section / exam
  const { years } = useAcademicYears();
  const {
    classes,
    allSections,
    setSelectedAcademicYearId,
  } = useAcademicClassSection({ autoSelectCurrentYear: false });
  const { exams } = useExams(
    schedule?.academic_year_id
      ? { academic_year_id: schedule.academic_year_id, class_id: schedule.class_id }
      : {},
  );

  useEffect(() => {
    if (schedule?.academic_year_id) {
      setSelectedAcademicYearId(schedule.academic_year_id);
    }
  }, [schedule?.academic_year_id]);

  const yearName = years.find((y) => y.id === schedule?.academic_year_id)?.name ?? "—";
  const className = classes.find((c) => c.id === schedule?.class_id)?.name ?? "—";
  const sectionName = schedule?.section_id
    ? (allSections.find((s) => s.id === schedule.section_id)?.name ?? "—")
    : "—";
  const examName = exams.find((e) => e.id === schedule?.exam_id)?.exam_name ?? "—";

  if (isLoading) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  if (!schedule) {
    return (
      <Div type="row" justify="center" className="py-20">
        <P color="muted">Schedule not found.</P>
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      <PageHeader
        title={isEdit ? "Edit Schedule" : "View Schedule"}
        subtitle={schedule.subject_name}
        actions={
          <Div type="row" gap="sm">
            {!isEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(EXAM_ROUTES.schedule.edit(schedule.id))
                }
              >
                <Pencil size={14} /> Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(EXAM_ROUTES.schedule.list)}
            >
              <ArrowLeft size={14} /> {SCHEDULE_PAGE.buttons.cancel}
            </Button>
          </Div>
        }
      />

      {/* Read-only meta */}
      <Div variant="card" className="p-4">
        <Div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs">Academic Year</P>
            <P>{yearName}</P>
          </Div>
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs">Class</P>
            <P>{className}</P>
          </Div>
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs">Section</P>
            <P>{sectionName}</P>
          </Div>
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs">Exam</P>
            <P>{examName}</P>
          </Div>
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs">Subject Type</P>
            <Badge variant={schedule.subject_type === "MAIN_EXAM" ? "info" : "warning"}>
              {schedule.subject_type.replace(/_/g, " ")}
            </Badge>
          </Div>
          {subSchedules.length > 0 && (
            <Div type="col" gap="xs">
              <P color="muted" className="text-xs">Sub-Subjects</P>
              <P>{subSchedules.length}</P>
            </Div>
          )}
        </Div>
      </Div>

      {/* Editable fields */}
      <form onSubmit={onSubmit}>
        <Div type="col" gap="md">
          <Div variant="card" className="p-5">
            <Div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                label={SCHEDULE_PAGE.labels.subject + " *"}
                error={errors.subject_name?.message}
              >
                <Input
                  {...register("subject_name")}
                  disabled={!isEdit}
                />
              </FormField>

              <FormField label={SCHEDULE_PAGE.labels.subjectType}>
                <Select {...register("subject_type")} disabled={!isEdit}>
                  {SUBJECT_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={SCHEDULE_PAGE.labels.examDate + " *"}
                error={errors.exam_date?.message}
              >
                <Input
                  {...register("exam_date")}
                  type="date"
                  disabled={!isEdit}
                />
              </FormField>

              <FormField
                label={SCHEDULE_PAGE.labels.startTime + " *"}
                error={errors.start_time?.message}
              >
                <Input
                  {...register("start_time")}
                  type="time"
                  disabled={!isEdit}
                />
              </FormField>

              <FormField
                label={SCHEDULE_PAGE.labels.endTime + " *"}
                error={errors.end_time?.message}
              >
                <Input
                  {...register("end_time")}
                  type="time"
                  disabled={!isEdit}
                />
              </FormField>

              <FormField label={SCHEDULE_PAGE.labels.examMarks + " *"}>
                <Input
                  {...register("exam_marks")}
                  type="number"
                  min={0}
                  disabled={!isEdit}
                />
              </FormField>

              <FormField label={SCHEDULE_PAGE.labels.passingMarks + " *"}>
                <Input
                  {...register("passing_marks")}
                  type="number"
                  min={0}
                  disabled={!isEdit}
                />
              </FormField>

              <FormField label={SCHEDULE_PAGE.labels.room}>
                <Select {...register("hall_detail_id")} disabled={!isEdit}>
                  <option value="">Select room</option>
                  {hallRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </Div>

            {isEdit && (
              <Div type="row" align="center" gap="sm" className="mt-4">
                <Controller
                  control={control}
                  name="sub_subject_enabled"
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="sub_enabled"
                      checked={field.value ?? false}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-border"
                    />
                  )}
                />
                <label htmlFor="sub_enabled" className="text-sm text-foreground">
                  {SCHEDULE_PAGE.labels.subSubjectEnabled}
                </label>
              </Div>
            )}
          </Div>

          {/* Sub-schedules read-only list */}
          {subSchedules.length > 0 && (
            <Div type="col" gap="sm">
              <P className="text-sm font-medium">Sub-Subjects</P>
              {subSchedules.map((sub, i) => (
                <Div key={sub.id} variant="glass-sm" className="p-3">
                  <Div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <Div type="col" gap="xs">
                      <P color="muted" className="text-xs">Name</P>
                      <P>{sub.subject_name}</P>
                    </Div>
                    <Div type="col" gap="xs">
                      <P color="muted" className="text-xs">Type</P>
                      <Badge variant="warning">{sub.subject_type.replace(/_/g, " ")}</Badge>
                    </Div>
                    <Div type="col" gap="xs">
                      <P color="muted" className="text-xs">Date</P>
                      <P>{sub.exam_date}</P>
                    </Div>
                    <Div type="col" gap="xs">
                      <P color="muted" className="text-xs">Time</P>
                      <P>{sub.start_time} – {sub.end_time}</P>
                    </Div>
                    <Div type="col" gap="xs">
                      <P color="muted" className="text-xs">Max Marks</P>
                      <P>{sub.exam_marks}</P>
                    </Div>
                    <Div type="col" gap="xs">
                      <P color="muted" className="text-xs">Pass Marks</P>
                      <P>{sub.passing_marks}</P>
                    </Div>
                  </Div>
                </Div>
              ))}
            </Div>
          )}

          {isEdit && (
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
          )}
        </Div>
      </form>
    </Div>
  );
}

export default function ScheduleViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ScheduleViewContent />
    </Suspense>
  );
}
