"use client";

import { useState } from "react";
import type { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import {
  BookOpen,
  FileText,
  MapPin,
  Paperclip,
  Plus,
  Trash2,
  User,
  Users,
  IdCard,
} from "lucide-react";
import {
  ActionSheet,
  Button,
  ControlledChoiceChips,
  ControlledSelectField,
  ControlledToggleRow,
  FieldRow,
  FormGroup,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  PhotoHero,
  StepHeader,
  StepPanel,
  type PhotoHeroProps,
} from "@/components/ui";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useClassSections } from "@/hooks/useClassSections";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { StudentFormValues } from "@/lib/validations/students.validation";
import type { StudentNextNumbers } from "@/types/students.types";
import { DocumentViewButton } from "@/components/shared/DocumentViewButton";
import {
  BLOOD_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PARENT_RELATION_OPTIONS,
  QUALIFICATION_OPTIONS,
  RELIGION_OPTIONS,
  STUDENT_STATUS_OPTIONS,
} from "@/constants/students.constants";

const STEPS: ReadonlyArray<FormStep<StudentFormValues>> = [
  {
    id: "student",
    label: "Student",
    fields: ["first_name", "last_name", "date_of_birth", "gender", "blood_group", "profile_image"],
  },
  {
    id: "details",
    label: "Contact & identity",
    fields: [
      "dial_code", "phone_number", "email", "aadhaar_number", "religion", "category",
      "caste", "nationality", "height_cm", "weight_kg", "status", "is_enabled",
    ],
  },
  { id: "academic", label: "Academic", fields: ["academic_info"] },
  { id: "parents", label: "Parents", fields: ["parents"] },
  { id: "other", label: "Address & history", fields: ["address", "previous_academics", "hostel_info"] },
  { id: "documents", label: "Documents", fields: ["documents"] },
];

export interface StudentMobileFormProps {
  form: UseFormReturn<StudentFormValues>;
  parentsArray: UseFieldArrayReturn<StudentFormValues, "parents">;
  documentsArray: UseFieldArrayReturn<StudentFormValues, "documents">;
  photo: PhotoHeroProps;
  isNew: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onDocumentUpload: (file: File, index: number) => Promise<boolean> | void;
  onCancel?: () => void;
  banner?: React.ReactNode;
  nextNumbers?: StudentNextNumbers | null;
}

// ─── Parent card ──────────────────────────────────────────────────────────────

function ParentCard({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<StudentFormValues>;
  index: number;
  onRemove: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const { control, register, watch, formState } = form;
  const errors = formState.errors.parents?.[index];
  const relation = watch(`parents.${index}.relation`);
  const relationLabel =
    PARENT_RELATION_OPTIONS.find((o) => o.value === relation)?.label ?? "Parent";
  const loginEnabled = watch(`parents.${index}.enable_login`);
  const hasLogin = watch(`parents.${index}.has_login`);

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-muted/30 p-3">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">
          {relationLabel} · {index + 1}
        </h3>
        <button
          type="button"
          aria-label={`Remove ${relationLabel}`}
          onClick={onRemove}
          className="flex h-10 w-10 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
        >
          <Trash2 size={18} />
        </button>
      </header>

      <ControlledChoiceChips
        control={control}
        name={`parents.${index}.relation`}
        label="Relation"
        required
        options={PARENT_RELATION_OPTIONS}
      />
      <MobileTextField
        label="First name"
        required
        placeholder="First name"
        autoCapitalize="words"
        error={errors?.first_name?.message}
        {...register(`parents.${index}.first_name`)}
      />
      <MobileTextField
        label="Last name"
        placeholder="Last name"
        autoCapitalize="words"
        error={errors?.last_name?.message}
        {...register(`parents.${index}.last_name`)}
      />
      <input type="hidden" {...register(`parents.${index}.dial_code`)} />
      <MobileTextField
        label="Phone"
        required
        prefix="+91"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        placeholder="10-digit number"
        error={errors?.phone_number?.message}
        {...register(`parents.${index}.phone_number`)}
      />
      <MobileTextField
        label="Email"
        type="email"
        inputMode="email"
        autoCapitalize="none"
        placeholder="name@example.com"
        error={errors?.email?.message}
        {...register(`parents.${index}.email`)}
      />

      <ControlledToggleRow
        control={control}
        name={`parents.${index}.is_primary`}
        label="Primary contact"
        description="School reaches out to this person first"
      />
      <ControlledToggleRow
        control={control}
        name={`parents.${index}.can_pickup`}
        label="Can pick up the student"
      />

      {showMore ? (
        <>
          <MobileTextField
            label="Alternate phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            error={errors?.alternate_phone?.message}
            {...register(`parents.${index}.alternate_phone`)}
          />
          <MobileTextField
            label="Occupation"
            {...register(`parents.${index}.occupation`)}
          />
          <ControlledSelectField
            control={control}
            name={`parents.${index}.qualification`}
            label="Qualification"
            options={QUALIFICATION_OPTIONS}
          />
          <MobileTextField
            label="Annual income"
            inputMode="numeric"
            {...register(`parents.${index}.annual_income`)}
          />
          <MobileTextField
            label="Aadhaar number"
            inputMode="numeric"
            maxLength={12}
            error={errors?.aadhaar_number?.message}
            {...register(`parents.${index}.aadhaar_number`)}
          />
          <ControlledToggleRow
            control={control}
            name={`parents.${index}.enable_login`}
            label="Parent app login"
            description="Lets this parent sign in to the parent portal"
          />
          {loginEnabled &&
            (hasLogin ? (
              <ControlledToggleRow
                control={control}
                name={`parents.${index}.reset_password`}
                label="Reset password"
                description="Issue a new temporary password when you save"
              />
            ) : (
              <p className="px-1 text-xs text-muted-foreground">
                A temporary password will be generated when you save. The parent must change it
                after the first login.
              </p>
            ))}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="h-11 rounded-2xl text-sm font-semibold text-primary-text active:bg-muted"
        >
          More details
        </button>
      )}
    </section>
  );
}

// ─── Document card ────────────────────────────────────────────────────────────

function DocumentCard({
  form,
  index,
  isUploading,
  onUpload,
  onRemove,
}: {
  form: UseFormReturn<StudentFormValues>;
  index: number;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors.documents?.[index];
  const link = watch(`documents.${index}.document_link`);
  const filename = watch(`documents.${index}.original_filename`);

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-muted/30 p-3">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">Document {index + 1}</h3>
        <button
          type="button"
          aria-label="Remove document"
          onClick={onRemove}
          className="flex h-10 w-10 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
        >
          <Trash2 size={18} />
        </button>
      </header>

      <ControlledSelectField
        control={control}
        name={`documents.${index}.document_name`}
        label="Document type"
        required
        options={DOCUMENT_TYPE_OPTIONS}
      />

      <div data-invalid={errors?.document_link ? "true" : undefined}>
        <label
          className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-dashed bg-white px-4 py-2 active:bg-muted dark:bg-neutral-900 ${
            errors?.document_link ? "border-destructive" : "border-border"
          }`}
        >
          <Paperclip size={20} className="shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-[15px]">
            {isUploading ? "Uploading…" : link ? (filename || "File attached") : "Attach PDF, JPG or PNG · max 10 MB"}
          </span>
          <span className="text-sm font-semibold text-primary-text">
            {link ? "Replace" : "Browse"}
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        {errors?.document_link && (
          <p className="mt-1.5 px-1 text-xs font-medium text-destructive">
            Attach a file for this document
          </p>
        )}
      </div>
      {link && (
        <div className="px-1">
          <DocumentViewButton link={link} fileName={filename} />
        </div>
      )}

      <MobileTextField
        label="Remarks"
        placeholder="Optional notes"
        {...register(`documents.${index}.remarks`)}
      />
    </section>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export function StudentMobileForm({
  form,
  parentsArray,
  documentsArray,
  photo,
  isNew,
  isSubmitting,
  isUploading,
  onSubmit,
  onDocumentUpload,
  onCancel,
  banner,
  nextNumbers,
}: StudentMobileFormProps) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors;
  const [removeTarget, setRemoveTarget] = useState<
    { kind: "parent" | "document"; index: number } | null
  >(null);

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  const { years } = useAcademicYears();
  const yearId = watch("academic_info.academic_year_id") ?? "";
  const classId = watch("academic_info.class_id") ?? "";
  const { classes, sections } = useClassSections(yearId, classId);

  const hostelRequired = watch("hostel_info.hostel_required");
  const firstName = watch("first_name") ?? "";
  const lastName = watch("last_name") ?? "";
  const displayName = isNew ? "Add student" : `${firstName} ${lastName}`.trim() || "Edit student";

  return (
    <>
      <MultiStepForm
        title={displayName}
        steps={wizard.progress}
        activeId={wizard.activeId}
        onSelectStep={wizard.goTo}
        isFirst={wizard.isFirst}
        isLast={wizard.isLast}
        onBack={wizard.back}
        onNext={wizard.next}
        onSubmit={wizard.submit}
        submitLabel={isNew ? "Add student" : "Save changes"}
        isSubmitting={isSubmitting || isUploading}
        quickSave={!isNew}
        onCancel={onCancel}
        banner={banner}
      >
        {/* 1 · Student */}
        <StepPanel id="student">
          <StepHeader
            icon={<User size={22} />}
            title="About the student"
            description="Name, birth date and a photo."
          />
          <PhotoHero {...photo} name={`${firstName} ${lastName}`.trim()} />
          <FormGroup title="Name">
            <MobileTextField
              label="First name"
              required
              placeholder="First name"
              autoCapitalize="words"
              error={errors.first_name?.message}
              {...register("first_name")}
            />
            <MobileTextField
              label="Last name"
              placeholder="Last name"
              autoCapitalize="words"
              error={errors.last_name?.message}
              {...register("last_name")}
            />
          </FormGroup>
          <FormGroup title="Personal">
            <MobileTextField
              label="Date of birth"
              type="date"
              required
              error={errors.date_of_birth?.message}
              {...register("date_of_birth")}
            />
            <ControlledChoiceChips
              control={control}
              name="gender"
              label="Gender"
              required
              options={GENDER_OPTIONS}
            />
            <ControlledSelectField
              control={control}
              name="blood_group"
              label="Blood group"
              placeholder="Select blood group"
              options={BLOOD_GROUP_OPTIONS}
            />
          </FormGroup>
        </StepPanel>

        {/* 2 · Contact & identity */}
        <StepPanel id="details">
          <StepHeader
            icon={<IdCard size={22} />}
            title="Contact & identity"
            description="How to reach the student and identity details."
          />
          <input type="hidden" {...register("dial_code")} />
          <FormGroup title="Contact">
            <MobileTextField
              label="Phone"
              prefix="+91"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit number"
              error={errors.phone_number?.message}
              {...register("phone_number")}
            />
            <MobileTextField
              label="Email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </FormGroup>
          <FormGroup title="Identity">
            <MobileTextField
              label="Aadhaar number"
              inputMode="numeric"
              maxLength={12}
              placeholder="12-digit Aadhaar"
              error={errors.aadhaar_number?.message}
              {...register("aadhaar_number")}
            />
            <ControlledSelectField
              control={control}
              name="religion"
              label="Religion"
              placeholder="Select religion"
              options={RELIGION_OPTIONS}
            />
            <ControlledSelectField
              control={control}
              name="category"
              label="Category"
              placeholder="Select category"
              options={CATEGORY_OPTIONS}
            />
            <FieldRow>
              <MobileTextField label="Caste" {...register("caste")} />
              <MobileTextField label="Nationality" {...register("nationality")} />
            </FieldRow>
            <FieldRow>
              <MobileTextField
                label="Height (cm)"
                type="number"
                inputMode="decimal"
                {...register("height_cm")}
              />
              <MobileTextField
                label="Weight (kg)"
                type="number"
                inputMode="decimal"
                {...register("weight_kg")}
              />
            </FieldRow>
          </FormGroup>
          <FormGroup title="Status">
            <ControlledChoiceChips
              control={control}
              name="status"
              label="Student status"
              options={STUDENT_STATUS_OPTIONS}
            />
            <ControlledToggleRow
              control={control}
              name="is_enabled"
              label="Active and visible"
              description="Turn off to hide the student from lists"
            />
          </FormGroup>
        </StepPanel>

        {/* 3 · Academic */}
        <StepPanel id="academic">
          <StepHeader
            icon={<BookOpen size={22} />}
            title="Academic details"
            description="Where the student studies this year."
          />
          <FormGroup title="Class">
            <ControlledSelectField
              control={control}
              name="academic_info.academic_year_id"
              label="Academic year"
              required
              placeholder="Select year"
              options={years.map((y) => ({
                value: y.id,
                label: `${y.name}${y.is_current ? " (Current)" : ""}`,
              }))}
            />
            <ControlledSelectField
              control={control}
              name="academic_info.class_id"
              label="Class"
              required
              disabled={!yearId}
              placeholder={yearId ? "Select class" : "Choose a year first"}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
            <ControlledSelectField
              control={control}
              name="academic_info.section_id"
              label="Section"
              disabled={!classId}
              placeholder={classId ? "Select section" : "Choose a class first"}
              options={sections.map((s) => ({ value: s.id, label: s.name }))}
            />
          </FormGroup>
          <FormGroup title="Numbers">
            <MobileTextField
              label="Admission number"
              placeholder={nextNumbers?.admission_number ?? "Auto-generated on save"}
              readOnly
              {...register("academic_info.admission_number")}
            />
            <FieldRow>
              <MobileTextField
                label="Roll number"
                inputMode="numeric"
                maxLength={4}
                placeholder={nextNumbers?.roll_number ? `Next: ${nextNumbers.roll_number}` : "Auto"}
                error={errors.academic_info?.roll_number?.message}
                {...register("academic_info.roll_number")}
              />
              <MobileTextField
                label="Registration no."
                placeholder="Optional"
                maxLength={30}
                error={errors.academic_info?.registration_number?.message}
                {...register("academic_info.registration_number")}
              />
            </FieldRow>
            <MobileTextField
              label="Joining date"
              type="date"
              {...register("academic_info.joining_date")}
            />
          </FormGroup>
        </StepPanel>

        {/* 4 · Parents */}
        <StepPanel id="parents">
          <StepHeader
            icon={<Users size={22} />}
            title="Parents & guardians"
            description="At least one is required."
          />
          {parentsArray.fields.map((field, index) => (
            <ParentCard
              key={field.id}
              form={form}
              index={index}
              onRemove={() => setRemoveTarget({ kind: "parent", index })}
            />
          ))}
          {errors.parents?.root?.message && (
            <p className="px-1 text-sm font-medium text-destructive">
              {errors.parents.root.message}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() =>
              parentsArray.append({
                relation: parentsArray.fields.length === 0 ? "FATHER" : "MOTHER",
                first_name: "",
                phone_number: "",
                dial_code: "+91",
                is_primary: parentsArray.fields.length === 0,
                can_pickup: true,
              })
            }
          >
            <Plus size={18} /> Add parent / guardian
          </Button>
        </StepPanel>

        {/* 5 · Address & history */}
        <StepPanel id="other">
          <StepHeader
            icon={<MapPin size={22} />}
            title="Address & history"
            description="All optional — fill what you have."
          />
          <FormGroup title="Home address">
            <MobileTextArea
              label="Street address"
              placeholder="House no., street, area"
              {...register("address.address")}
            />
            <FieldRow>
              <MobileTextField label="City" {...register("address.city")} />
              <MobileTextField label="State" {...register("address.state")} />
            </FieldRow>
            <FieldRow>
              <MobileTextField
                label="Pincode"
                inputMode="numeric"
                maxLength={6}
                {...register("address.pincode")}
              />
              <MobileTextField label="Country" {...register("address.country")} />
            </FieldRow>
          </FormGroup>
          <FormGroup title="Previous school">
            <MobileTextField
              label="School name"
              {...register("previous_academics.previous_school_name")}
            />
            <FieldRow>
              <MobileTextField
                label="Class"
                {...register("previous_academics.previous_class")}
              />
              <MobileTextField
                label="Passing year"
                inputMode="numeric"
                maxLength={4}
                {...register("previous_academics.passing_year")}
              />
            </FieldRow>
            <FieldRow>
              <MobileTextField label="Board" {...register("previous_academics.board")} />
              <MobileTextField
                label="Marks / grade"
                {...register("previous_academics.total_marks")}
              />
            </FieldRow>
            <MobileTextField
              label="TC number"
              {...register("previous_academics.tc_number")}
            />
          </FormGroup>
          <FormGroup title="Hostel">
            <ControlledToggleRow
              control={control}
              name="hostel_info.hostel_required"
              label="Needs hostel"
            />
            {hostelRequired && (
              <>
                <MobileTextField
                  label="Hostel name"
                  required
                  error={errors.hostel_info?.hostel_name?.message}
                  {...register("hostel_info.hostel_name")}
                />
                <MobileTextField
                  label="Room number"
                  {...register("hostel_info.room_number")}
                />
              </>
            )}
          </FormGroup>
        </StepPanel>

        {/* 6 · Documents */}
        <StepPanel id="documents">
          <StepHeader
            icon={<FileText size={22} />}
            title="Documents"
            description="Attach certificates and records."
          />
          {documentsArray.fields.map((field, index) => (
            <DocumentCard
              key={field.id}
              form={form}
              index={index}
              isUploading={isUploading}
              onUpload={(file) => onDocumentUpload(file, index)}
              onRemove={() => setRemoveTarget({ kind: "document", index })}
            />
          ))}
          {documentsArray.fields.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No documents added yet
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() =>
              documentsArray.append({
                document_name: "BIRTH_CERTIFICATE",
                file_type: "PDF",
                document_link: "",
              })
            }
          >
            <Plus size={18} /> Add document
          </Button>
        </StepPanel>
      </MultiStepForm>

      <ActionSheet
        isOpen={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        actions={
          removeTarget
            ? [
                {
                  label: removeTarget.kind === "parent" ? "Remove parent" : "Remove document",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  confirm: {
                    title: removeTarget.kind === "parent" ? "Remove this parent?" : "Remove this document?",
                    description: "It will be removed when you save.",
                    confirmLabel: "Remove",
                  },
                  onClick: () => {
                    if (removeTarget.kind === "parent") parentsArray.remove(removeTarget.index);
                    else documentsArray.remove(removeTarget.index);
                  },
                },
              ]
            : []
        }
      />
    </>
  );
}
