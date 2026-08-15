"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAutoGenerateExam } from "@/hooks/exam/useAutoGenerateExam";
import { ExamFormContent } from "../exam-form";
import {
  Div,
  Button,
  Spinner,
  Input,
  Select,
  FormField,
  P,
  Badge,
  Tabs,
  MultiSelect,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
} from "@/components/ui";
import { EXAMS_PAGE, EXAM_ROUTES, EXAM_TERM_OPTIONS } from "@/constants/exam.constants";

const TAB_OPTIONS = [
  { value: "auto", label: "Auto Generate" },
  { value: "manual", label: "Manual" },
] as const;

type TabValue = (typeof TAB_OPTIONS)[number]["value"];

export default function NewExamPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>("auto");

  const pageHeaderConfig: PageHeaderConfig = {
    backButton: true,
    title: EXAMS_PAGE.pageHeading.title,
    subtitle: "Create a new exam manually or auto-generate with schedules",
    actions: [
      {
        label: EXAMS_PAGE.buttons.cancel,
        variant: "outline",
        onClick: () => router.push(EXAM_ROUTES.exams.list),
      },
    ],
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      <Tabs options={TAB_OPTIONS} value={tab} onChange={setTab} className="max-w-xs" />

      {tab === "auto" ? <AutoGenerateExamForm /> : <ExamFormContent slug="create-new" />}
    </PageCol>
  );
}

function AutoGenerateExamForm() {
  const {
    examName,
    setExamName,
    years,
    academicYearId,
    setAcademicYearId,
    classes,
    classIds,
    setClassIds,
    examTerm,
    setExamTerm,
    startDate,
    setStartDate,
    startDateError,
    endDate,
    setEndDate,
    endDateError,
    dailyStartTime,
    setDailyStartTime,
    dailyEndTime,
    setDailyEndTime,
    subjectDurationMinutes,
    setSubjectDurationMinutes,
    breakDurationMinutes,
    setBreakDurationMinutes,
    defaultExamMarks,
    setDefaultExamMarks,
    defaultPassingMarks,
    setDefaultPassingMarks,
    templateId,
    setTemplateId,
    templates,
    autoAssignSeating,
    setAutoAssignSeating,
    seatingHallIds,
    setSeatingHallIds,
    hallRooms,
    mappingsByClass,
    isLoadingMappings,
    totalSubjectCount,
    classesMissingMapping,
    canGenerate,
    isSubmitting,
    conflicts,
    generate,
    handleBack,
  } = useAutoGenerateExam();

  const classNameById = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Div type="col" gap="md" className="max-w-4xl">
      <Div variant="card" className="p-5 sm:p-6">
        <Div type="col" gap="md">
          <Div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Exam Name *" error={examName ? undefined : undefined}>
              <Input
                placeholder="e.g. Mid-Term Examination 2025"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </FormField>
            <FormField label="Academic Year *">
              <Select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
                <option value="">Select academic year</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                    {y.is_current ? " (Current)" : ""}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Classes * (select participating classes)">
              <MultiSelect
                options={classOptions}
                value={classIds}
                onChange={setClassIds}
                placeholder={!academicYearId ? "Select academic year first" : "Select class(es)..."}
                disabled={!academicYearId}
              />
            </FormField>
            <FormField label="Start from template (optional)">
              <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                <option value="">No template — set manually</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Term *">
              <Select value={examTerm} onChange={(e) => setExamTerm(e.target.value as typeof examTerm)}>
                {EXAM_TERM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Start Date *" error={startDateError}>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </FormField>
            <FormField label="End Date *" error={endDateError}>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </FormField>
            <FormField label="Daily Start Time">
              <Input type="time" value={dailyStartTime} onChange={(e) => setDailyStartTime(e.target.value)} />
            </FormField>
            <FormField label="Daily End Time">
              <Input type="time" value={dailyEndTime} onChange={(e) => setDailyEndTime(e.target.value)} />
            </FormField>
            <FormField label="Subject Duration (minutes)">
              <Input
                type="number"
                min={15}
                step={5}
                value={subjectDurationMinutes}
                onChange={(e) => setSubjectDurationMinutes(Number(e.target.value) || 0)}
              />
            </FormField>
            <FormField label="Break Between Subjects (minutes)">
              <Input
                type="number"
                min={0}
                step={5}
                value={breakDurationMinutes}
                onChange={(e) => setBreakDurationMinutes(Number(e.target.value) || 0)}
              />
            </FormField>
            <FormField label="Default Max Marks">
              <Input
                type="number"
                min={0}
                value={defaultExamMarks}
                onChange={(e) => setDefaultExamMarks(Number(e.target.value) || 0)}
              />
            </FormField>
            <FormField label="Default Passing Marks">
              <Input
                type="number"
                min={0}
                value={defaultPassingMarks}
                onChange={(e) => setDefaultPassingMarks(Number(e.target.value) || 0)}
              />
            </FormField>
          </Div>
        </Div>
      </Div>

      {classIds.length > 0 && (
        <Div variant="card" className="p-5 sm:p-6">
          <Div type="col" gap="md">
            <P size="sm" weight="semibold">Subjects & Teachers (from class-subject mapping)</P>
            {isLoadingMappings ? (
              <Div type="row" justify="center" className="py-4">
                <Spinner size="sm" />
              </Div>
            ) : (
              <Div type="col" gap="md">
                {classIds.map((cid) => {
                  const mappings = mappingsByClass[cid] ?? [];
                  return (
                    <Div key={cid} type="col" gap="xs">
                      <P size="sm" className="text-muted-foreground font-medium">
                        {classNameById[cid] ?? cid}
                        {mappings.length === 0 && " — no subject-teacher mapping found"}
                      </P>
                      {mappings.length > 0 && (
                        <Div type="row" gap="xs" wrap className="pl-2">
                          {mappings.map((m) => (
                            <Badge key={m.id} variant="info">{m.subject_name} — {m.teacher_name}</Badge>
                          ))}
                        </Div>
                      )}
                    </Div>
                  );
                })}
              </Div>
            )}
            {classesMissingMapping.length > 0 && (
              <Div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3">
                <P size="sm" className="text-amber-700 dark:text-amber-400">
                  {classesMissingMapping.length} class{classesMissingMapping.length > 1 ? "es have" : " has"} no
                  subject-teacher mapping — set it up first so subjects can be auto-scheduled.
                </P>
              </Div>
            )}
            {totalSubjectCount > 0 && (
              <Div className="border-t border-border pt-3">
                <Badge variant="default">{totalSubjectCount} subject-slots to schedule across all classes</Badge>
              </Div>
            )}
          </Div>
        </Div>
      )}

      <Div variant="card" className="p-5 sm:p-6">
        <Div type="col" gap="md">
          <Div type="row" align="center" gap="sm">
            <input
              type="checkbox"
              id="auto_assign_seating"
              checked={autoAssignSeating}
              onChange={(e) => setAutoAssignSeating(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="auto_assign_seating" className="text-sm text-foreground font-medium">
              Auto-assign seating (rooms) after creating exam
            </label>
          </Div>
          {autoAssignSeating ? (
            <FormField label="Rooms to seat students in *">
              <MultiSelect
                options={hallRooms.map((r) => ({ value: r.id, label: r.room_name }))}
                value={seatingHallIds}
                onChange={setSeatingHallIds}
                placeholder="Select room(s)..."
              />
            </FormField>
          ) : (
            <P size="sm" className="text-muted-foreground">
              Leave unchecked to assign seating manually later from the Sitting Plan page.
            </P>
          )}
        </Div>
      </Div>

      {conflicts.length > 0 && (
        <Div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-5">
          <Div type="col" gap="sm">
            <P size="sm" weight="semibold" className="text-red-700 dark:text-red-400">
              Nothing was created — {conflicts.length} subject{conflicts.length > 1 ? "s" : ""} didn&apos;t fit
            </P>
            <Div type="col" gap="xs" className="pl-2">
              {conflicts.map((c, i) => (
                <P key={i} size="sm" className="text-red-700 dark:text-red-400">
                  {c.class_name} — {c.subject_name}
                  {c.exam_date ? ` (${c.exam_date})` : ""}: {c.reason.replace(/_/g, " ").toLowerCase()}
                </P>
              ))}
            </Div>
            {conflicts.some((c) => c.reason === "NOT_ENOUGH_WORKING_DAYS") && (
              <P size="sm" className="text-red-700 dark:text-red-400 pt-2 border-t border-red-200 dark:border-red-900">
                Not enough working days in the date range — widen the date range or shorten subject duration/break.
              </P>
            )}
          </Div>
        </Div>
      )}

      <Div type="row" gap="md" className="pt-2">
        <Button variant="outline" onClick={handleBack}>Cancel</Button>
        <Button onClick={generate} loading={isSubmitting} disabled={!canGenerate}>
          Auto Create Exam
        </Button>
      </Div>
    </Div>
  );
}
