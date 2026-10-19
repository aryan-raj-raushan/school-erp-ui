"use client";

import { CalendarClock, GraduationCap, Sparkles } from "lucide-react";
import {
  Badge,
  FieldRow,
  FormGroup,
  MobileMultiSelectField,
  MobileSelectField,
  MobileTextField,
  MultiStepForm,
  Spinner,
  StepHeader,
  StepPanel,
  ToggleRow,
  ChoiceChips,
} from "@/components/ui";
import { useStepper } from "@/hooks/useStepper";
import type { useAutoGenerateExam } from "@/hooks/exam/useAutoGenerateExam";
import { EXAM_TERM_OPTIONS } from "@/constants/exam.constants";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "schedule", label: "Schedule" },
  { id: "review", label: "Review" },
] as const;

type AutoExamState = ReturnType<typeof useAutoGenerateExam>;

const numberInput = (value: number, set: (n: number) => void, min = 0, step = 1) => ({
  type: "number" as const,
  inputMode: "numeric" as const,
  min,
  step,
  value,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(Number(e.target.value) || 0),
});

export function AutoExamMobileForm({ state }: { state: AutoExamState }) {
  const stepper = useStepper(STEPS);
  const classNameById = Object.fromEntries(state.classes.map((c) => [c.id, c.name]));

  return (
    <MultiStepForm
      title="Auto-generate exam"
      steps={stepper.progress}
      activeId={stepper.activeId}
      onSelectStep={stepper.goTo}
      isFirst={stepper.isFirst}
      isLast={stepper.isLast}
      onBack={stepper.back}
      onNext={stepper.next}
      onSubmit={state.generate}
      submitLabel="Auto create exam"
      isSubmitting={state.isSubmitting}
      onCancel={state.handleBack}
    >
      <StepPanel id="basics">
        <StepHeader
          icon={<GraduationCap size={22} />}
          title="Exam basics"
          description="Which exam, year and classes."
        />
        <FormGroup>
          <MobileTextField
            label="Exam name"
            required
            placeholder="e.g. Mid-Term Examination 2025"
            value={state.examName}
            onChange={(e) => state.setExamName(e.target.value)}
          />
          <MobileSelectField
            label="Academic year"
            required
            placeholder="Select academic year"
            value={state.academicYearId}
            onChange={state.setAcademicYearId}
            options={state.years.map((y) => ({
              value: y.id,
              label: `${y.name}${y.is_current ? " (Current)" : ""}`,
            }))}
          />
          <MobileMultiSelectField
            label="Classes"
            required
            disabled={!state.academicYearId}
            placeholder={state.academicYearId ? "Select class(es)" : "Select academic year first"}
            value={state.classIds}
            onChange={state.setClassIds}
            options={state.classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <ChoiceChips
            label="Term"
            required
            value={state.examTerm}
            onChange={(value) => state.setExamTerm(value as typeof state.examTerm)}
            options={EXAM_TERM_OPTIONS}
          />
          <MobileSelectField
            label="Start from template"
            placeholder="No template — set manually"
            value={state.templateId}
            onChange={state.setTemplateId}
            options={state.templates.map((t) => ({ value: t.id, label: t.name }))}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="schedule">
        <StepHeader
          icon={<CalendarClock size={22} />}
          title="Schedule"
          description="Dates, daily timings and default marks."
        />
        <FormGroup title="Dates">
          <FieldRow>
            <MobileTextField
              label="Starts"
              type="date"
              required
              error={state.startDateError}
              value={state.startDate}
              onChange={(e) => state.setStartDate(e.target.value)}
            />
            <MobileTextField
              label="Ends"
              type="date"
              required
              error={state.endDateError}
              value={state.endDate}
              onChange={(e) => state.setEndDate(e.target.value)}
            />
          </FieldRow>
        </FormGroup>
        <FormGroup title="Daily timings">
          <FieldRow>
            <MobileTextField
              label="Day starts"
              type="time"
              value={state.dailyStartTime}
              onChange={(e) => state.setDailyStartTime(e.target.value)}
            />
            <MobileTextField
              label="Day ends"
              type="time"
              value={state.dailyEndTime}
              onChange={(e) => state.setDailyEndTime(e.target.value)}
            />
          </FieldRow>
          <FieldRow>
            <MobileTextField
              label="Subject (min)"
              {...numberInput(state.subjectDurationMinutes, state.setSubjectDurationMinutes, 15, 5)}
            />
            <MobileTextField
              label="Break (min)"
              {...numberInput(state.breakDurationMinutes, state.setBreakDurationMinutes, 0, 5)}
            />
          </FieldRow>
        </FormGroup>
        <FormGroup title="Default marks">
          <FieldRow>
            <MobileTextField
              label="Max marks"
              {...numberInput(state.defaultExamMarks, state.setDefaultExamMarks)}
            />
            <MobileTextField
              label="Passing marks"
              {...numberInput(state.defaultPassingMarks, state.setDefaultPassingMarks)}
            />
          </FieldRow>
        </FormGroup>
      </StepPanel>

      <StepPanel id="review">
        <StepHeader
          icon={<Sparkles size={22} />}
          title="Review & seating"
          description="Subjects come from the class-subject mapping."
        />

        {state.classIds.length > 0 && (
          <FormGroup title="Subjects & teachers">
            {state.isLoadingMappings ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : (
              state.classIds.map((classId) => {
                const mappings = state.mappingsByClass[classId] ?? [];
                return (
                  <section
                    key={classId}
                    className="rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900"
                  >
                    <h4 className="text-sm font-semibold">{classNameById[classId] ?? classId}</h4>
                    {mappings.length === 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        No subject-teacher mapping found
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {mappings.map((m) => (
                          <Badge key={m.id} variant="info">
                            {m.subject_name} — {m.teacher_name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })
            )}
            {state.classesMissingMapping.length > 0 && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
                {state.classesMissingMapping.length} class
                {state.classesMissingMapping.length > 1 ? "es have" : " has"} no subject-teacher
                mapping — set it up first so subjects can be auto-scheduled.
              </p>
            )}
            {state.totalSubjectCount > 0 && (
              <Badge variant="default">
                {state.totalSubjectCount} subject-slots to schedule
              </Badge>
            )}
          </FormGroup>
        )}

        <FormGroup title="Seating">
          <ToggleRow
            label="Auto-assign seating"
            description="Seat students in rooms right after creating the exam"
            checked={state.autoAssignSeating}
            onChange={state.setAutoAssignSeating}
          />
          {state.autoAssignSeating && (
            <MobileMultiSelectField
              label="Rooms"
              required
              placeholder="Select room(s)"
              value={state.seatingHallIds}
              onChange={state.setSeatingHallIds}
              options={state.hallRooms.map((r) => ({ value: r.id, label: r.room_name }))}
            />
          )}
        </FormGroup>

        {state.conflicts.length > 0 && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">
              Nothing was created — {state.conflicts.length} subject
              {state.conflicts.length > 1 ? "s" : ""} didn&apos;t fit
            </h4>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-red-700 dark:text-red-400">
              {state.conflicts.map((c, i) => (
                <li key={i}>
                  {c.class_name} — {c.subject_name}
                  {c.exam_date ? ` (${c.exam_date})` : ""}: {c.reason.replace(/_/g, " ").toLowerCase()}
                </li>
              ))}
            </ul>
            {state.conflicts.some((c) => c.reason === "NOT_ENOUGH_WORKING_DAYS") && (
              <p className="mt-2 border-t border-red-200 pt-2 text-sm text-red-700 dark:border-red-900 dark:text-red-400">
                Not enough working days in the date range — widen the date range or shorten subject
                duration/break.
              </p>
            )}
          </section>
        )}

        {!state.canGenerate && (
          <p className="px-1 text-xs text-muted-foreground">
            Fill in the name, year, classes and dates to enable auto-create.
          </p>
        )}
      </StepPanel>
    </MultiStepForm>
  );
}
