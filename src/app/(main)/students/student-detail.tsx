"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useClassSections } from "@/hooks/useClassSections";
import {
  Pencil,
  Plus,
  Trash2,
  ArrowLeft,
  User,
  BookOpen,
  History,
  MapPin,
  Home,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H3,
  P,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
  Spinner,
  Badge,
  FormGrid,
  PhotoUpload,
  PhoneField,
  ResponsiveSelect,
  PageCol,
} from "@/components/ui";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  STATUS_BADGE,
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  RELIGION_OPTIONS,
  CATEGORY_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  PARENT_RELATION_OPTIONS,
  QUALIFICATION_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_FILE_TYPE_OPTIONS,
} from "@/constants/students.constants";
import { useStudentDetail } from "@/hooks/useStudentDetail";

// ─── Section Wrapper ───────────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SectionCard({
  icon,
  title,
  children,
  defaultOpen = true,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Div variant="card" className="overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        className="w-full h-auto flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors rounded-none"
        onClick={() => setOpen((v) => !v)}
      >
        <Div type="row" align="center" gap="sm">
          <Div className="text-muted-foreground">{icon}</Div>
          <H3 color="default" className="text-sm font-semibold">
            {title}
          </H3>
        </Div>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </Button>
      {open && <Div className="px-6 pb-6">{children}</Div>}
    </Div>
  );
}

// ─── Main Form Component ───────────────────────────────────────────────────────

export function StudentDetail({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const router = useRouter();
  const {
    student,
    isLoading,
    isEditing,
    setIsEditing,
    isNew,
    form,
    parentsArray,
    documentsArray,
    isUploading,
    profileImageUrl,
    isUploadingImage,
    imageInputRef,
    onImageChange,
    handleSubmit,
    isSubmitting,
    handleDocumentUpload,
    sourceEnquiry,
    isPrefilling,
  } = useStudentDetail(id);

  const { years, currentYear } = useAcademicYears();

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const watchedAcademicYearId = watch("academic_info.academic_year_id");
  const watchedClassId = watch("academic_info.class_id");
  const watchedHostelRequired = watch("hostel_info.hostel_required");
  const { classes, sections } = useClassSections(
    watchedAcademicYearId ?? "",
    watchedClassId ?? "",
  );

  // Set edit mode from URL param
  useEffect(() => {
    if (isEditMode) setIsEditing(true);
  }, [isEditMode, setIsEditing]);

  // Set current year default on new
  useEffect(() => {
    if (isNew && currentYear && !watchedAcademicYearId) {
      setValue("academic_info.academic_year_id", currentYear.id);
    }
  }, [isNew, currentYear, watchedAcademicYearId, setValue]);

  // Auto-add one parent row for new students
  useEffect(() => {
    if (isNew && parentsArray.fields.length === 0) {
      parentsArray.append({
        relation: "FATHER",
        first_name: "",
        phone_number: "",
        dial_code: "+91",
        is_primary: true,
        can_pickup: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  if (isLoading) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  const isReadOnly = !isEditing;

  return (
    <PageCol>
      <Div type="col" gap="md" className="max-w-7xl">
        <PageHeader
          sticky
          title={
            isNew
              ? "Add New Student"
              : `${student?.student.first_name ?? ""} ${
                  student?.student.last_name ?? ""
                }`
          }
          subtitle={
            !isNew && student
              ? `System No: #${student.student.system_number}`
              : ""
          }
          actions={
            <Div type="row" gap="sm" align="center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(STUDENT_ROUTES.list)}
              >
                <ArrowLeft size={14} /> {STUDENT_PAGE.buttons.back}
              </Button>
              {!isNew && !isEditing && (
                <>
                  <Badge
                    variant={STATUS_BADGE[student?.student.status ?? "ACTIVE"]}
                  >
                    {student?.student.status}
                  </Badge>
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil size={14} /> {STUDENT_PAGE.buttons.edit}
                  </Button>
                </>
              )}
              {isEditing && (
                <>
                  {!isNew && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      {STUDENT_PAGE.buttons.cancel}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    form="student-form"
                    size="sm"
                    loading={isSubmitting || isUploading}
                  >
                    {STUDENT_PAGE.buttons.save}
                  </Button>
                </>
              )}
            </Div>
          }
        />

        {isNew && (sourceEnquiry || isPrefilling) && (
          <Div
            type="col"
            gap="xs"
            className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-4"
          >
            {isPrefilling ? (
              <P size="sm">Loading enquiry details…</P>
            ) : (
              <>
                <P size="sm" className="font-medium">
                  Prefilled from admission enquiry —{" "}
                  {sourceEnquiry?.student_name}
                </P>
                {sourceEnquiry?.registration_fee_required && (
                  <P size="sm" color="muted">
                    ⚠️ Registration fee is marked as required for this
                    admission. Please collect it separately via the Fees module.
                  </P>
                )}
              </>
            )}
          </Div>
        )}

        <form id="student-form" onSubmit={handleSubmit}>
          <Div type="col" gap="md">
            {/* ── Basic Information ───────────────────────────────────────── */}
            <SectionCard
              icon={<User size={16} />}
              title={STUDENT_PAGE.sections.basicInfo}
            >
              <Div type="col" gap="md">
                <PhotoUpload
                  url={profileImageUrl}
                  isUploading={isUploadingImage}
                  disabled={isReadOnly}
                  onFileChange={onImageChange}
                  inputRef={imageInputRef}
                  hint="JPG, PNG or WebP · max 10MB"
                />
                <FormGrid>
                  <FormField
                    label={STUDENT_PAGE.labels.firstName}
                    required
                    error={errors.first_name?.message}
                  >
                    <Input
                      {...register("first_name")}
                      placeholder="Enter first name"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField
                    label={STUDENT_PAGE.labels.lastName}
                    error={errors.last_name?.message}
                  >
                    <Input
                      {...register("last_name")}
                      placeholder="Enter last name"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField
                    label={STUDENT_PAGE.labels.dob}
                    required
                    error={errors.date_of_birth?.message}
                  >
                    <Input
                      {...register("date_of_birth")}
                      type="date"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField
                    label={STUDENT_PAGE.labels.gender}
                    required
                    error={errors.gender?.message}
                  >
                    <ResponsiveSelect
                      {...register("gender")}
                      disabled={isReadOnly}
                      customPlaceholder="Select gender"
                      options={GENDER_OPTIONS}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.bloodGroup}>
                    <ResponsiveSelect
                      {...register("blood_group")}
                      disabled={isReadOnly}
                      customPlaceholder="Select blood group"
                      options={BLOOD_GROUP_OPTIONS}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.religion}>
                    <ResponsiveSelect
                      {...register("religion")}
                      disabled={isReadOnly}
                      customPlaceholder="Select religion"
                      options={RELIGION_OPTIONS}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.category}>
                    <ResponsiveSelect
                      {...register("category")}
                      disabled={isReadOnly}
                      customPlaceholder="Select category"
                      options={CATEGORY_OPTIONS}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.caste}>
                    <Input
                      {...register("caste")}
                      placeholder="Enter caste"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.nationality}>
                    <Input
                      {...register("nationality")}
                      placeholder="Indian"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField
                    label={STUDENT_PAGE.labels.aadhaar}
                    error={errors.aadhaar_number?.message}
                  >
                    <Input
                      {...register("aadhaar_number")}
                      placeholder="12-digit aadhaar"
                      maxLength={12}
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField
                    label={STUDENT_PAGE.labels.idCardNumber}
                    hint="Managed from RFID Setup page"
                  >
                    <Input
                      {...register("id_card_number")}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.height}>
                    <Input
                      {...register("height_cm")}
                      type="number"
                      placeholder="e.g. 160"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.weight}>
                    <Input
                      {...register("weight_kg")}
                      type="number"
                      placeholder="e.g. 55"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <PhoneField
                    label={STUDENT_PAGE.labels.phone}
                    dialCodeProps={register("dial_code")}
                    phoneProps={register("phone_number")}
                    phoneError={errors.phone_number?.message}
                    disabled={isReadOnly}
                  />
                  <FormField
                    label={STUDENT_PAGE.labels.email}
                    error={errors.email?.message}
                  >
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="Email address"
                      disabled={isReadOnly}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.status}>
                    <ResponsiveSelect
                      {...register("status")}
                      disabled={isReadOnly}
                      options={STUDENT_STATUS_OPTIONS}
                    />
                  </FormField>
                  <FormField label={STUDENT_PAGE.labels.isEnabled}>
                    <Div type="row" align="center" gap="sm" className="pt-2">
                      <input
                        type="checkbox"
                        {...register("is_enabled")}
                        id="is_enabled"
                        className="h-4 w-4 rounded border-border"
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="is_enabled"
                        className="text-sm text-foreground"
                      >
                        Student is active and visible
                      </label>
                    </Div>
                  </FormField>
                </FormGrid>
              </Div>
            </SectionCard>

            {/* ── Academic Information ────────────────────────────────────── */}
            <SectionCard
              icon={<BookOpen size={16} />}
              title={STUDENT_PAGE.sections.academicInfo}
            >
              <FormGrid>
                <FormField
                  label={STUDENT_PAGE.labels.academicYear}
                  required
                  error={errors.academic_info?.academic_year_id?.message}
                >
                  <ResponsiveSelect
                    {...register("academic_info.academic_year_id")}
                    disabled={isReadOnly}
                    customPlaceholder="Select academic year"
                    options={years.map((y) => ({
                      value: y.id,
                      label: `${y.name}${y.is_current ? " (Current)" : ""}`,
                    }))}
                  />
                </FormField>
                <FormField
                  label={STUDENT_PAGE.labels.class}
                  required
                  error={errors.academic_info?.class_id?.message}
                >
                  <ResponsiveSelect
                    {...register("academic_info.class_id")}
                    disabled={isReadOnly || !watchedAcademicYearId}
                    customPlaceholder="Select class"
                    options={classes.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.section}>
                  <ResponsiveSelect
                    {...register("academic_info.section_id")}
                    disabled={isReadOnly || !watchedClassId}
                    customPlaceholder="Select section"
                    options={sections.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                  />
                </FormField>
                <FormField
                  label={STUDENT_PAGE.labels.admissionNumber}
                  required
                  error={errors.academic_info?.admission_number?.message}
                >
                  <Input
                    {...register("academic_info.admission_number")}
                    placeholder="Admission number"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.registrationNumber}>
                  <Input
                    {...register("academic_info.registration_number")}
                    placeholder="Registration number"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.rollNumber}>
                  <Input
                    {...register("academic_info.roll_number")}
                    placeholder="Roll number"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.joiningDate}>
                  <Input
                    {...register("academic_info.joining_date")}
                    type="date"
                    disabled={isReadOnly}
                  />
                </FormField>
              </FormGrid>
            </SectionCard>

            {/* ── Previous Academic Details ───────────────────────────────── */}
            <SectionCard
              icon={<History size={16} />}
              title={STUDENT_PAGE.sections.previousAcademics}
              defaultOpen={false}
            >
              <FormGrid>
                <FormField label={STUDENT_PAGE.labels.previousSchool}>
                  <Input
                    {...register("previous_academics.previous_school_name")}
                    placeholder="Previous school name"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.previousClass}>
                  <Input
                    {...register("previous_academics.previous_class")}
                    placeholder="e.g. Class 9"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.passingYear}>
                  <Input
                    {...register("previous_academics.passing_year")}
                    placeholder="e.g. 2023"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.totalMarks}>
                  <Input
                    {...register("previous_academics.total_marks")}
                    placeholder="e.g. 480/500 or A+"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.board}>
                  <Input
                    {...register("previous_academics.board")}
                    placeholder="e.g. CBSE"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.tcNumber}>
                  <Input
                    {...register("previous_academics.tc_number")}
                    placeholder="TC certificate number"
                    disabled={isReadOnly}
                  />
                </FormField>
              </FormGrid>
            </SectionCard>

            {/* ── Address ─────────────────────────────────────────────────── */}
            <SectionCard
              icon={<MapPin size={16} />}
              title={STUDENT_PAGE.sections.address}
              defaultOpen={false}
            >
              <FormGrid>
                <FormField
                  label={STUDENT_PAGE.labels.address}
                  className="col-span-full"
                >
                  <Textarea
                    {...register("address.address")}
                    placeholder="Full address"
                    rows={2}
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.city}>
                  <Input
                    {...register("address.city")}
                    placeholder="City"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.state}>
                  <Input
                    {...register("address.state")}
                    placeholder="State"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.pincode}>
                  <Input
                    {...register("address.pincode")}
                    placeholder="Pincode"
                    disabled={isReadOnly}
                  />
                </FormField>
                <FormField label={STUDENT_PAGE.labels.country}>
                  <Input
                    {...register("address.country")}
                    placeholder="India"
                    disabled={isReadOnly}
                  />
                </FormField>
              </FormGrid>
            </SectionCard>

            {/* ── Hostel Information ──────────────────────────────────────── */}
            <SectionCard
              icon={<Home size={16} />}
              title={STUDENT_PAGE.sections.hostelInfo}
              defaultOpen={false}
            >
              <Div type="col" gap="md">
                <Div type="row" align="center" gap="sm">
                  <input
                    type="checkbox"
                    {...register("hostel_info.hostel_required")}
                    id="hostel_required"
                    className="h-4 w-4 rounded border-border"
                    disabled={isReadOnly}
                  />
                  <label
                    htmlFor="hostel_required"
                    className="text-sm text-foreground"
                  >
                    {STUDENT_PAGE.labels.hostelRequired}
                  </label>
                </Div>
                {watchedHostelRequired && (
                  <FormGrid>
                    <FormField
                      label={STUDENT_PAGE.labels.hostelName}
                      required
                      error={errors.hostel_info?.hostel_name?.message}
                    >
                      <Input
                        {...register("hostel_info.hostel_name")}
                        placeholder="Hostel name"
                        disabled={isReadOnly}
                      />
                    </FormField>
                    <FormField label={STUDENT_PAGE.labels.roomNumber}>
                      <Input
                        {...register("hostel_info.room_number")}
                        placeholder="Room number"
                        disabled={isReadOnly}
                      />
                    </FormField>
                  </FormGrid>
                )}
              </Div>
            </SectionCard>

            {/* ── Parent / Guardian Details ───────────────────────────────── */}
            <SectionCard
              icon={<Users size={16} />}
              title={STUDENT_PAGE.sections.parents}
            >
              <Div type="col" gap="md">
                {parentsArray.fields.map((field, index) => (
                  <Div key={field.id} variant="glass-sm" className="p-4">
                    <Div
                      type="row"
                      justify="between"
                      align="center"
                      className="mb-4"
                    >
                      <H3 color="default">
                        {PARENT_RELATION_OPTIONS.find(
                          (r) => r.value === watch(`parents.${index}.relation`),
                        )?.label ?? `Parent ${index + 1}`}
                      </H3>
                      {isEditing && (
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          type="button"
                          onClick={() => parentsArray.remove(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </Div>
                    <FormGrid>
                      <FormField
                        label={STUDENT_PAGE.labels.relation}
                        required
                        error={errors.parents?.[index]?.relation?.message}
                      >
                        <ResponsiveSelect
                          {...register(`parents.${index}.relation`)}
                          disabled={isReadOnly}
                          customPlaceholder="Select relation"
                          options={PARENT_RELATION_OPTIONS}
                        />
                      </FormField>
                      <FormField
                        label={STUDENT_PAGE.labels.parentFirstName}
                        required
                        error={errors.parents?.[index]?.first_name?.message}
                      >
                        <Input
                          {...register(`parents.${index}.first_name`)}
                          placeholder="First name"
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <FormField label={STUDENT_PAGE.labels.parentLastName}>
                        <Input
                          {...register(`parents.${index}.last_name`)}
                          placeholder="Last name"
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <PhoneField
                        label={STUDENT_PAGE.labels.parentPhone}
                        required
                        dialCodeProps={register(`parents.${index}.dial_code`)}
                        phoneProps={register(`parents.${index}.phone_number`)}
                        phoneError={
                          errors.parents?.[index]?.phone_number?.message
                        }
                        disabled={isReadOnly}
                      />
                      <FormField label={STUDENT_PAGE.labels.alternatePhone}>
                        <Input
                          {...register(`parents.${index}.alternate_phone`)}
                          placeholder="Alternate phone"
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <FormField
                        label={STUDENT_PAGE.labels.parentEmail}
                        error={errors.parents?.[index]?.email?.message}
                      >
                        <Input
                          {...register(`parents.${index}.email`)}
                          type="email"
                          placeholder="Email"
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <FormField label={STUDENT_PAGE.labels.occupation}>
                        <Input
                          {...register(`parents.${index}.occupation`)}
                          placeholder="Occupation"
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <FormField label={STUDENT_PAGE.labels.qualification}>
                        <ResponsiveSelect
                          {...register(`parents.${index}.qualification`)}
                          disabled={isReadOnly}
                          customPlaceholder="Select qualification"
                          options={QUALIFICATION_OPTIONS}
                        />
                      </FormField>
                      <FormField label={STUDENT_PAGE.labels.annualIncome}>
                        <Input
                          {...register(`parents.${index}.annual_income`)}
                          placeholder="Annual income"
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <FormField
                        label={STUDENT_PAGE.labels.parentAadhaar}
                        error={errors.parents?.[index]?.aadhaar_number?.message}
                      >
                        <Input
                          {...register(`parents.${index}.aadhaar_number`)}
                          placeholder="12-digit aadhaar"
                          maxLength={12}
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <Div className="flex gap-6 pt-2 col-span-full">
                        <Div type="row" align="center" gap="sm">
                          <input
                            type="checkbox"
                            {...register(`parents.${index}.is_primary`)}
                            id={`primary-${index}`}
                            disabled={isReadOnly}
                            className="h-4 w-4 rounded border-border"
                          />
                          <label
                            htmlFor={`primary-${index}`}
                            className="text-sm"
                          >
                            {STUDENT_PAGE.labels.isPrimary}
                          </label>
                        </Div>
                        <Div type="row" align="center" gap="sm">
                          <input
                            type="checkbox"
                            {...register(`parents.${index}.can_pickup`)}
                            id={`pickup-${index}`}
                            disabled={isReadOnly}
                            className="h-4 w-4 rounded border-border"
                          />
                          <label
                            htmlFor={`pickup-${index}`}
                            className="text-sm"
                          >
                            {STUDENT_PAGE.labels.canPickup}
                          </label>
                        </Div>
                      </Div>
                    </FormGrid>
                  </Div>
                ))}
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      parentsArray.append({
                        relation: "FATHER",
                        first_name: "",
                        phone_number: "",
                        dial_code: "+91",
                        is_primary: false,
                        can_pickup: true,
                      })
                    }
                  >
                    <Plus size={14} /> Add Parent / Guardian
                  </Button>
                )}
                {errors.parents?.root?.message && (
                  <P className="text-xs text-destructive">
                    {errors.parents.root.message}
                  </P>
                )}
                {parentsArray.fields.length === 0 && (
                  <P color="muted" className="text-center py-4">
                    No parent details added yet
                  </P>
                )}
              </Div>
            </SectionCard>

            {/* ── Documents ───────────────────────────────────────────────── */}
            <SectionCard
              icon={<FileText size={16} />}
              title={STUDENT_PAGE.sections.documents}
              defaultOpen={false}
            >
              <Div type="col" gap="md">
                {documentsArray.fields.map((field, index) => (
                  <Div key={field.id} variant="glass-sm" className="p-4">
                    <Div
                      type="row"
                      justify="between"
                      align="center"
                      className="mb-4"
                    >
                      <H3 color="default">Document {index + 1}</H3>
                      {isEditing && (
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          type="button"
                          onClick={() => documentsArray.remove(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </Div>
                    <FormGrid>
                      <FormField
                        label={STUDENT_PAGE.labels.documentName}
                        required
                        error={
                          errors.documents?.[index]?.document_name?.message
                        }
                      >
                        <ResponsiveSelect
                          {...register(`documents.${index}.document_name`)}
                          disabled={isReadOnly}
                          customPlaceholder="Select document type"
                          options={DOCUMENT_TYPE_OPTIONS}
                        />
                      </FormField>
                      <FormField
                        label={STUDENT_PAGE.labels.fileType}
                        required
                        error={errors.documents?.[index]?.file_type?.message}
                      >
                        <ResponsiveSelect
                          {...register(`documents.${index}.file_type`)}
                          disabled={isReadOnly}
                          customPlaceholder="Select type"
                          options={DOCUMENT_FILE_TYPE_OPTIONS}
                        />
                      </FormField>
                      <FormField label="Upload File">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isReadOnly || isUploading}
                          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload(file, index);
                          }}
                        />
                      </FormField>
                      <FormField
                        label={STUDENT_PAGE.labels.documentLink}
                        required
                        error={
                          errors.documents?.[index]?.document_link?.message
                        }
                      >
                        <Input
                          {...register(`documents.${index}.document_link`)}
                          placeholder="https://..."
                          disabled={isReadOnly}
                        />
                      </FormField>
                      <FormField label={STUDENT_PAGE.labels.remarks}>
                        <Input
                          {...register(`documents.${index}.remarks`)}
                          placeholder="Optional notes"
                          disabled={isReadOnly}
                        />
                      </FormField>
                    </FormGrid>
                  </Div>
                ))}
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      documentsArray.append({
                        document_name: "BIRTH_CERTIFICATE",
                        file_type: "PDF",
                        document_link: "",
                      })
                    }
                  >
                    <Plus size={14} /> {STUDENT_PAGE.buttons.addDocument}
                  </Button>
                )}
                {documentsArray.fields.length === 0 && (
                  <P color="muted" className="text-center py-4">
                    No documents uploaded yet
                  </P>
                )}
              </Div>
            </SectionCard>
          </Div>
        </form>
      </Div>
    </PageCol>
  );
}
