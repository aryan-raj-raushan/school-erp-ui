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
  PageCol,
} from "@/components/ui";
import { EXAM_ROUTES, EXAM_TERM_OPTIONS } from "@/constants/exam.constants";

const TAB_OPTIONS = [
  { value: "auto", label: "Auto Generate" },
  { value: "manual", label: "Manual" },
] as const;

type TabValue = (typeof TAB_OPTIONS)[number]["value"];

export default function NewExamPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>("auto");

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title="Create Exam"
        actions={
          <Button variant="outline" onClick={() => router.push(EXAM_ROUTES.exams.list)}>
            Cancel
          </Button>
        }
      />

      <Tabs options={TAB_OPTIONS} value={tab} onChange={setTab} className="max-w-xs" />

      {tab === "auto" ? <AutoGenerateExamForm /> : <ExamFormContent slug="create-new" />}
    </Div>
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
    endDate,
    setEndDate,
    dailyStartTime,
    setDailyStartTime,
    dailyEndTime,
    setDailyEndTime,
    defaultExamMarks,
    setDefaultExamMarks,
    defaultPassingMarks,
    setDefaultPassingMarks,
    templateId,
    setTemplateId,
    templates,
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
    <PageCol>
      <Div type="col" gap="md" className="max-w-3xl rounded-xl border border-border bg-card p-5">
        <Div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Exam Name *">
            <Input
              placeholder="e.g. Mid-Term Examination 2025"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </FormField>
          <FormField label="Academic Year *">
            <Select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                  {y.is_current ? " (Current)" : ""}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Classes * (whole school or select a few)">
            <MultiSelect
              options={classOptions}
              value={classIds}
              onChange={setClassIds}
              placeholder="Select class(es)..."
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
          <FormField label="Start Date *">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
          <FormField label="End Date *">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormField>
          <FormField label="Daily Start Time">
            <Input type="time" value={dailyStartTime} onChange={(e) => setDailyStartTime(e.target.value)} />
          </FormField>
          <FormField label="Daily End Time">
            <Input type="time" value={dailyEndTime} onChange={(e) => setDailyEndTime(e.target.value)} />
          </FormField>
          <FormField label="Default Marks">
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

      {classIds.length > 0 && (
        <Div type="col" gap="sm" className="max-w-3xl rounded-xl border border-border bg-card p-5">
          <P size="sm" weight="semibold">Subjects &amp; Teachers (from class-subject mapping)</P>
          {isLoadingMappings ? (
            <Spinner size="sm" />
          ) : (
            <Div type="col" gap="sm">
              {classIds.map((cid) => {
                const mappings = mappingsByClass[cid] ?? [];
                return (
                  <Div key={cid} type="col" gap="xs">
                    <P size="sm" className="text-muted-foreground">
                      {classNameById[cid] ?? cid}
                      {mappings.length === 0 && " — no subject-teacher mapping found"}
                    </P>
                    {mappings.length > 0 && (
                      <Div type="row" gap="xs" wrap>
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
            <P size="sm" className="text-amber-600 dark:text-amber-400">
              {classesMissingMapping.length} class{classesMissingMapping.length > 1 ? "es" : ""} have no
              subject-teacher mapping set up — set it up first so subjects can be auto-scheduled.
            </P>
          )}
          {totalSubjectCount > 0 && (
            <Badge variant="default">{totalSubjectCount} subject-slots to schedule across all classes</Badge>
          )}
        </Div>
      )}

      {conflicts.length > 0 && (
        <Div type="col" gap="xs" className="max-w-3xl rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-5">
          <P size="sm" weight="semibold" className="text-amber-700 dark:text-amber-400">
            {conflicts.length} item{conflicts.length > 1 ? "s" : ""} need attention
          </P>
          <Div type="col" gap="xs">
            {conflicts.map((c, i) => (
              <P key={i} size="sm" className="text-amber-700 dark:text-amber-400">
                {c.class_name} — {c.subject_name}
                {c.exam_date ? ` (${c.exam_date})` : ""}: {c.reason.replace(/_/g, " ").toLowerCase()}
              </P>
            ))}
          </Div>
        </Div>
      )}

      <Div type="row" gap="md">
        <Button variant="outline" onClick={handleBack}>Cancel</Button>
        <Button onClick={generate} loading={isSubmitting} disabled={!canGenerate}>
          Auto Create Exam
        </Button>
      </Div>
    </PageCol>
  );
}
