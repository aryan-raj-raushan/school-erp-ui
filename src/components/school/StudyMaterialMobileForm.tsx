"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { BookOpen, FileUp } from "lucide-react";
import {
  Button,
  ControlledChoiceChips,
  ControlledSelectField,
  FormGroup,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { CreateStudyMaterialFormValues } from "@/hooks/useCreateStudyMaterial";

const CONTENT_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "file", label: "Image / PDF" },
  { value: "youtube", label: "YouTube" },
];

const STEPS: ReadonlyArray<FormStep<CreateStudyMaterialFormValues>> = [
  {
    id: "course",
    label: "Course",
    fields: ["academic_year_id", "class_id", "subject_id", "title"],
  },
  {
    id: "content",
    label: "Content",
    fields: ["content_type", "content_text", "youtube_url"],
  },
];

export interface StudyMaterialMobileFormProps {
  form: UseFormReturn<CreateStudyMaterialFormValues>;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
  years: ReadonlyArray<{ id: string; name: string; is_current?: boolean }>;
  classes: ReadonlyArray<{ id: string; name: string }>;
  subjects: ReadonlyArray<{ id: string; name: string }>;
  isLoadingSubjects: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
}

export function StudyMaterialMobileForm({
  form,
  isSubmitting,
  onSubmit,
  onCancel,
  years,
  classes,
  subjects,
  isLoadingSubjects,
  fileRef,
}: StudyMaterialMobileFormProps) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors;
  const [fileName, setFileName] = useState("");

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  const classId = watch("class_id");
  const contentType = watch("content_type");

  let subjectPlaceholder = "Select subject";
  if (classId && isLoadingSubjects) subjectPlaceholder = "Loading subjects…";
  else if (classId && subjects.length === 0) subjectPlaceholder = "No subjects mapped to this class";

  return (
    <MultiStepForm
      title="Add material"
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel="Save"
      isSubmitting={isSubmitting}
      onCancel={onCancel}
    >
      <StepPanel id="course">
        <StepHeader
          icon={<BookOpen size={22} />}
          title="Course details"
          description="Where this material belongs."
        />
        <FormGroup>
          <ControlledSelectField
            control={control}
            name="academic_year_id"
            label="Session"
            required
            placeholder="Select session"
            options={years.map((y) => ({
              value: y.id,
              label: `${y.name}${y.is_current ? " (Current)" : ""}`,
            }))}
          />
          <ControlledSelectField
            control={control}
            name="class_id"
            label="Class"
            required
            placeholder="Select class"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <ControlledSelectField
            control={control}
            name="subject_id"
            label="Subject"
            disabled={!classId || isLoadingSubjects}
            placeholder={subjectPlaceholder}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <MobileTextField
            label="Document title"
            required
            placeholder="Enter title"
            error={errors.title?.message}
            {...register("title")}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="content">
        <StepHeader
          icon={<FileUp size={22} />}
          title="Content"
          description="Text, a file or a YouTube link."
        />
        <ControlledChoiceChips
          control={control}
          name="content_type"
          label="Content type"
          options={CONTENT_TYPE_OPTIONS}
        />
        {contentType === "text" && (
          <MobileTextArea
            label="Study document text"
            required
            rows={8}
            placeholder="Type something"
            error={errors.content_text?.message}
            {...register("content_text")}
          />
        )}
        {contentType === "file" && (
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => fileRef.current?.click()}
            >
              <FileUp size={18} /> {fileName ? "Change file" : "Choose image or PDF"}
            </Button>
            {fileName && <p className="truncate px-1 text-sm text-muted-foreground">{fileName}</p>}
          </div>
        )}
        {contentType === "youtube" && (
          <MobileTextField
            label="YouTube link"
            required
            type="url"
            inputMode="url"
            autoCapitalize="none"
            placeholder="https://www.youtube.com/watch?v=…"
            error={errors.youtube_url?.message}
            {...register("youtube_url")}
          />
        )}
      </StepPanel>
    </MultiStepForm>
  );
}
