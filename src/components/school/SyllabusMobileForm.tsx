"use client";

import type { UseFormReturn } from "react-hook-form";
import { ExternalLink, FileText, Paperclip, X } from "lucide-react";
import {
  Badge,
  Button,
  ControlledSelectField,
  ControlledToggleRow,
  FormGroup,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { CreateSyllabusFormValues } from "@/hooks/useCreateSyllabus";
import { SYLLABUS_PAGE } from "@/constants";

const STEPS: ReadonlyArray<FormStep<CreateSyllabusFormValues>> = [
  { id: "details", label: "Details", fields: ["class_id", "title", "content", "is_enabled"] },
  { id: "files", label: "Files", fields: [] },
];

export interface SyllabusAttachmentItem {
  id: string;
  name: string;
  url?: string;
  isImage: boolean;
  status?: "uploading" | "done" | "error";
  onRemove: () => void;
}

export interface SyllabusMobileFormProps {
  form: UseFormReturn<CreateSyllabusFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
  classes: ReadonlyArray<{ id: string; name: string }>;
  attachments: ReadonlyArray<SyllabusAttachmentItem>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function AttachmentRow({ item }: { item: SyllabusAttachmentItem }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900">
      {item.isImage && item.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FileText size={20} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        {item.status === "uploading" && <Badge variant="default">Uploading…</Badge>}
        {item.status === "done" && <Badge variant="success">Uploaded</Badge>}
        {item.status === "error" && <Badge variant="danger">Error</Badge>}
      </div>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${item.name}`}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
        >
          <ExternalLink size={18} />
        </a>
      )}
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={item.onRemove}
        className="flex h-11 w-11 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
      >
        <X size={18} />
      </button>
    </li>
  );
}

export function SyllabusMobileForm({
  form,
  isNew,
  isSubmitting,
  onSubmit,
  onCancel,
  classes,
  attachments,
  fileInputRef,
  onFileChange,
}: SyllabusMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  return (
    <MultiStepForm
      title={isNew ? SYLLABUS_PAGE.form.createTitle : SYLLABUS_PAGE.form.editTitle}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={isNew ? SYLLABUS_PAGE.form.submit : "Save changes"}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
    >
      <StepPanel id="details">
        <StepHeader title="Syllabus details" description="Which class and what it covers." />
        <FormGroup>
          <ControlledSelectField
            control={control}
            name="class_id"
            label={SYLLABUS_PAGE.form.class}
            required
            placeholder={SYLLABUS_PAGE.placeholders.selectClass}
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <MobileTextField
            label={SYLLABUS_PAGE.form.title}
            required
            placeholder={SYLLABUS_PAGE.placeholders.title}
            error={errors.title?.message}
            {...register("title")}
          />
          <MobileTextArea
            label={SYLLABUS_PAGE.form.content}
            rows={6}
            placeholder={SYLLABUS_PAGE.placeholders.content}
            error={errors.content?.message}
            {...register("content")}
          />
          <ControlledToggleRow
            control={control}
            name="is_enabled"
            label={SYLLABUS_PAGE.form.isEnabled}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="files">
        <StepHeader
          icon={<Paperclip size={22} />}
          title={SYLLABUS_PAGE.form.attachments}
          description={SYLLABUS_PAGE.form.attachmentsHint}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
        {attachments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No files attached</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {attachments.map((item) => (
              <AttachmentRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={18} /> Attach file
        </Button>
      </StepPanel>
    </MultiStepForm>
  );
}
