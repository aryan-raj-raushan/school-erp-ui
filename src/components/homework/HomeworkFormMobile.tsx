"use client";

import type { UseFormReturn } from "react-hook-form";
import { ExternalLink, FileText, Paperclip, X } from "lucide-react";
import {
  Badge,
  Button,
  ControlledChoiceChips,
  ControlledSelectField,
  ControlledToggleRow,
  FieldRow,
  FormGroup,
  MobileTextArea,
  MobileTextField,
  StepHeader,
  StickyActionBar,
} from "@/components/ui";
import { HOMEWORK_PAGE, HOMEWORK_STATUS_OPTIONS } from "@/constants";
import type { CreateHomeworkFormValues } from "@/hooks/useCreateHomework";

export interface HomeworkAttachmentItem {
  id: string;
  name: string;
  status: "saved" | "uploading" | "done" | "error";
  url?: string;
  isImage: boolean;
}

export interface HomeworkFormMobileProps {
  form: UseFormReturn<CreateHomeworkFormValues>;
  title: string;
  submitLabel: string;
  classes: ReadonlyArray<{ id: string; name: string }>;
  subjects: ReadonlyArray<{ id: string; name: string }>;
  isLoadingSubjects: boolean;
  attachments: ReadonlyArray<HomeworkAttachmentItem>;
  onAttach: () => void;
  onRemoveAttachment: (id: string) => void;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
}

const STATUS_BADGE = {
  saved: { variant: "success", label: "Saved" },
  uploading: { variant: "default", label: "Uploading…" },
  done: { variant: "success", label: "Uploaded" },
  error: { variant: "danger", label: "Failed" },
} as const;

/**
 * Phone layout for creating / editing homework — shared by both screens.
 * Details, options, description, attachments and a pinned submit bar.
 */
export function HomeworkFormMobile({
  form,
  title,
  submitLabel,
  classes,
  subjects,
  isLoadingSubjects,
  attachments,
  onAttach,
  onRemoveAttachment,
  isSubmitting,
  onSubmit,
  onCancel,
}: HomeworkFormMobileProps) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors;
  const classId = watch("class_id");

  const subjectPlaceholder = !classId
    ? HOMEWORK_PAGE.placeholders.selectSubject
    : isLoadingSubjects
      ? "Loading subjects…"
      : subjects.length === 0
        ? "No subjects mapped to this class"
        : HOMEWORK_PAGE.placeholders.selectSubject;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 pt-3">
      <StepHeader icon={<FileText size={22} />} title={title} />

      <FormGroup title="Assignment">
        <ControlledSelectField
          control={control}
          name="class_id"
          label={HOMEWORK_PAGE.form.class}
          required
          placeholder={HOMEWORK_PAGE.placeholders.selectClass}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
        />
        <ControlledSelectField
          control={control}
          name="subject_id"
          label={HOMEWORK_PAGE.form.subject}
          disabled={!classId || isLoadingSubjects}
          placeholder={subjectPlaceholder}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        />
        <MobileTextField
          label={HOMEWORK_PAGE.form.title}
          required
          placeholder={HOMEWORK_PAGE.placeholders.title}
          error={errors.title?.message}
          {...register("title")}
        />
        <FieldRow>
          <MobileTextField
            label={HOMEWORK_PAGE.form.homeworkDate}
            type="date"
            error={errors.homework_date?.message}
            {...register("homework_date")}
          />
          <MobileTextField
            label={HOMEWORK_PAGE.form.dueDate}
            type="date"
            required
            error={errors.due_date?.message}
            {...register("due_date")}
          />
        </FieldRow>
        <ControlledChoiceChips
          control={control}
          name="status"
          label={HOMEWORK_PAGE.form.status}
          options={HOMEWORK_STATUS_OPTIONS}
        />
      </FormGroup>

      <FormGroup title="Details">
        <MobileTextArea
          label={HOMEWORK_PAGE.form.description}
          placeholder={HOMEWORK_PAGE.placeholders.description}
          rows={5}
          {...register("description")}
        />
        <ControlledToggleRow
          control={control}
          name="send_notification"
          label={HOMEWORK_PAGE.form.sendNotification}
        />
        <ControlledToggleRow
          control={control}
          name="student_upload_allowed"
          label={HOMEWORK_PAGE.form.studentUploadAllowed}
        />
      </FormGroup>

      <FormGroup title={HOMEWORK_PAGE.form.attachments} description={HOMEWORK_PAGE.form.attachmentsHint}>
        {attachments.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {attachments.map((att) => {
              const badge = STATUS_BADGE[att.status];
              return (
                <li
                  key={att.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900"
                >
                  {att.isImage && att.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={att.url} alt={att.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <FileText size={20} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{att.name}</p>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open file"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={() => onRemoveAttachment(att.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                  >
                    <X size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Button type="button" variant="outline" size="lg" onClick={onAttach}>
          <Paperclip size={18} /> Attach file or photo
        </Button>
      </FormGroup>

      <StickyActionBar>
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>
          {HOMEWORK_PAGE.form.cancel}
        </Button>
        <Button type="submit" size="lg" className="flex-[2]" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </StickyActionBar>
    </form>
  );
}
