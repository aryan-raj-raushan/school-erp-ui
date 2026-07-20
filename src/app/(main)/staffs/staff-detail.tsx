"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useStaffDetail, getStaffRoleLabel } from "@/hooks/useStaffDetail";
import { BLOOD_GROUP_LABEL, GENDER_LABEL, BLOOD_GROUPS } from "@/constants";
import {
  Div,
  H2,
  P,
  Button,
  Input,
  Textarea,
  FormField,
  Badge,
  Spinner,
  PageHeader,
  FormGrid,
  PhotoUpload,
  PhoneField,
  ResponsiveSelect,
} from "@/components/ui";

export function StaffDetail({ id }: { id: string }) {
  const isNew = id === "create-new";
  const resolvedId = id === "create-new" ? undefined : id;

  const {
    staff,
    isEditing,
    setIsEditing,
    form,
    isLoadingData,
    profileImageUrl,
    isUploadingImage,
    imageInputRef,
    onImageChange,
    roles,
    staffMembers,
    fullName,
    reportingToName,
    isSubmitting,
    handleSubmit,
    handleBack,
    handleCancelEdit,
  } = useStaffDetail(resolvedId);

  if (isLoadingData) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  return (
    <Div type="col" gap="md" className="max-w-7xl">
      {/* Header */}
      <PageHeader
        sticky
        title={isNew ? "Add Employee" : fullName}
        subtitle={
          !isNew && staff?.employee_code
            ? `Employee Code: ${staff.employee_code}`
            : ""
        }
        actions={
          <Div type="row" gap="sm" align="center">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft size={14} /> Back
            </Button>
            {!isNew && !isEditing && (
              <>
                <Badge variant={staff?.is_active ? "success" : "default"}>
                  {staff?.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil size={14} /> Edit
                </Button>
              </>
            )}
            {(isEditing || isNew) && (
              <>
                {!isNew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  form="staff-form"
                  size="sm"
                  loading={isSubmitting}
                >
                  {isNew ? "Add Employee" : "Save Changes"}
                </Button>
              </>
            )}
          </Div>
        }
      />

      {/* View mode */}
      {!isEditing && !isNew && staff && (
        <Div type="col" gap="md">
          {/* Avatar + basic info */}
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <Div type="row" gap="lg" align="center">
              <PhotoUpload
                url={profileImageUrl}
                size="md"
                disabled
                onFileChange={() => {}}
              />
              <Div type="col" gap="xs">
                <H2>{fullName}</H2>
                <Badge variant="info">
                  {getStaffRoleLabel(staff, roles) ?? ""}
                </Badge>
                <Badge variant={staff?.is_active ? "success" : "default"}>
                  {staff?.is_active ? "Active" : "Inactive"}
                </Badge>
              </Div>
            </Div>
          </Div>

          {/* Personal info */}
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Personal Information
            </H2>
            <FormGrid>
              <InfoRow label="Email" value={staff?.email} />
              <InfoRow
                label="Phone"
                value={
                  staff?.phone_number
                    ? `${staff?.dial_code ?? ""} ${staff?.phone_number}`.trim()
                    : undefined
                }
              />
              <InfoRow
                label="Gender"
                value={
                  staff?.gender
                    ? GENDER_LABEL[staff.gender] ?? staff.gender
                    : undefined
                }
              />
              <InfoRow
                label="Date of Birth"
                value={formatDate(staff?.date_of_birth)}
              />
              <InfoRow
                label="Blood Group"
                value={
                  staff?.blood_group
                    ? BLOOD_GROUP_LABEL[staff.blood_group] ?? staff.blood_group
                    : undefined
                }
              />
              <InfoRow label="City" value={staff?.city} />
              <InfoRow label="Father's Name" value={staff?.father_name} />
              <InfoRow label="Husband's Name" value={staff?.husband_name} />
              <InfoRow label="RFID Card" value={staff?.rfid_card_number} />
              <InfoRow label="Qualification" value={staff?.qualification} />
            </FormGrid>
            {staff?.address && (
              <Div className="mt-2">
                <InfoRow label="Address" value={staff?.address} />
              </Div>
            )}
            {staff?.permanent_address && (
              <Div className="mt-1">
                <InfoRow
                  label="Permanent Address"
                  value={staff?.permanent_address}
                />
              </Div>
            )}
          </Div>

          {/* Employment info */}
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Employment
            </H2>
            <FormGrid>
              <InfoRow label="Role" value={getStaffRoleLabel(staff, roles)} />
              <InfoRow label="Employee Code" value={staff?.employee_code} />
              <InfoRow
                label="Joining Date"
                value={formatDate(staff?.joining_date)}
              />
              <InfoRow label="Reporting To" value={reportingToName} />
            </FormGrid>
          </Div>

          {/* Work experience */}
          {(staff?.previous_employer ||
            staff?.previous_role ||
            staff?.total_experience) && (
            <Div
              type="col"
              gap="sm"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Work Experience
              </H2>
              <FormGrid>
                <InfoRow
                  label="Previous Employer"
                  value={staff?.previous_employer}
                />
                <InfoRow label="Previous Role" value={staff?.previous_role} />
                <InfoRow
                  label="Total Experience"
                  value={staff?.total_experience}
                />
              </FormGrid>
            </Div>
          )}
        </Div>
      )}

      {/* Create / Edit form */}
      {(isEditing || isNew) && (
        <form id="staff-form" onSubmit={handleSubmit}>
          <Div type="col" gap="md">
            {/* Personal information */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Personal Information
              </H2>

              <PhotoUpload
                url={profileImageUrl}
                isUploading={isUploadingImage}
                onFileChange={onImageChange}
                inputRef={imageInputRef}
                hint="JPG, PNG or WebP · max 10MB"
              />

              <FormGrid>
                <FormField
                  label="First Name"
                  required
                  error={form.formState.errors.first_name?.message}
                >
                  <Input
                    placeholder="Enter first name"
                    {...form.register("first_name")}
                  />
                </FormField>
                <FormField label="Last Name">
                  <Input
                    placeholder="Enter last name"
                    {...form.register("last_name")}
                  />
                </FormField>
                <PhoneField
                  label="Phone"
                  required
                  dialCodeProps={form.register("dial_code")}
                  phoneProps={form.register("phone_number")}
                  phoneError={form.formState.errors.phone_number?.message}
                />
                <FormField
                  label="Email"
                  error={form.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="Enter email"
                    {...form.register("email")}
                  />
                </FormField>
                <FormField
                  label="Gender"
                  required
                  error={form.formState.errors.gender?.message}
                >
                  <ResponsiveSelect
                    {...form.register("gender")}
                    customPlaceholder="Select gender"
                    options={[
                      { value: "MALE", label: "Male" },
                      { value: "FEMALE", label: "Female" },
                      { value: "OTHER", label: "Other" },
                    ]}
                  />
                </FormField>
                <FormField
                  label="Date of Birth"
                  required
                  error={form.formState.errors.date_of_birth?.message}
                >
                  <Input type="date" {...form.register("date_of_birth")} />
                </FormField>
                <FormField label="Blood Group">
                  <ResponsiveSelect
                    {...form.register("blood_group")}
                    customPlaceholder="Select blood group"
                    options={BLOOD_GROUPS.map((bg) => ({ value: bg.value, label: bg.label }))}
                  />
                </FormField>
                <FormField label="City">
                  <Input placeholder="Enter city" {...form.register("city")} />
                </FormField>
                <FormField label="Father's Name">
                  <Input
                    placeholder="Enter father's name"
                    {...form.register("father_name")}
                  />
                </FormField>
                <FormField label="Husband's Name">
                  <Input
                    placeholder="Enter husband's name"
                    {...form.register("husband_name")}
                  />
                </FormField>
                <FormField label="Address" className="col-span-full">
                  <Textarea
                    rows={2}
                    placeholder="Enter current address"
                    {...form.register("address")}
                  />
                </FormField>
                <FormField label="Permanent Address" className="col-span-full">
                  <Textarea
                    rows={2}
                    placeholder="Enter permanent address"
                    {...form.register("permanent_address")}
                  />
                </FormField>
              </FormGrid>
            </Div>

            {/* Employment information */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Employment
              </H2>

              <FormGrid>
                <FormField
                  label="Role"
                  required
                  error={form.formState.errors.role_id?.message}
                >
                  <ResponsiveSelect
                    {...form.register("role_id")}
                    customPlaceholder="Select role"
                    options={roles.map((r) => ({
                      value: r.id,
                      label: r.name,
                    }))}
                  />
                </FormField>
                <FormField label="Reporting To">
                  <ResponsiveSelect
                    {...form.register("reporting_to_id")}
                    customPlaceholder="Select manager"
                    options={staffMembers
                      .filter((s) => s.id !== (resolvedId ?? ""))
                      .map((s) => ({
                        value: s.id,
                        label: `${s.first_name} ${s.last_name ?? ""}`,
                      }))}
                  />
                </FormField>
                <FormField label="Joining Date">
                  <Input type="date" {...form.register("joining_date")} />
                </FormField>
                <FormField label="Employee Code">
                  <Input
                    placeholder="EMP-001"
                    {...form.register("employee_code")}
                  />
                </FormField>
                <FormField label="Qualification">
                  <Input
                    placeholder="M.Ed, B.Sc, etc."
                    {...form.register("qualification")}
                  />
                </FormField>
                <FormField
                  label="RFID Card Number"
                  hint="Managed from RFID Setup page"
                >
                  <Input
                    readOnly
                    {...form.register("rfid_card_number")}
                    className="bg-muted cursor-not-allowed"
                  />
                </FormField>
              </FormGrid>
            </Div>

            {/* Work experience */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Work Experience
              </H2>
              <FormGrid>
                <FormField label="Previous Employer">
                  <Input
                    placeholder="Previous employer name"
                    {...form.register("previous_employer")}
                  />
                </FormField>
                <FormField label="Role at Previous Employer">
                  <Input
                    placeholder="Previous role"
                    {...form.register("previous_role")}
                  />
                </FormField>
                <FormField label="Total Experience">
                  <Input
                    placeholder="e.g. 5 years"
                    {...form.register("total_experience")}
                  />
                </FormField>
              </FormGrid>
            </Div>

            {/* Login details — only on create */}
            {isNew && (
              <Div
                type="col"
                gap="md"
                className="rounded-xl border border-border bg-card p-5"
              >
                <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Login Details
                </H2>
                <P color="muted" className="text-xs -mt-2">
                  Staff will log in with their email / phone number and this
                  password.
                </P>
                <FormGrid>
                  <FormField
                    label="Password"
                    required
                    error={form.formState.errors.password?.message}
                  >
                    <Input
                      type="password"
                      placeholder="Min 6 characters"
                      {...form.register("password")}
                    />
                  </FormField>
                  <Div type="row" align="center" gap="sm" className="pt-6">
                    <input
                      type="checkbox"
                      id="is_active"
                      {...form.register("is_active")}
                      defaultChecked
                      className="h-4 w-4 rounded border-border"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm select-none cursor-pointer"
                    >
                      Enabled
                    </label>
                  </Div>
                </FormGrid>
              </Div>
            )}
          </Div>
        </form>
      )}
    </Div>
  );
}

function InfoRow({ label, value }: { label: string; value?: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  const display =
    value instanceof Date ? value.toLocaleDateString() : String(value);
  return (
    <Div type="col" gap="xs">
      <P color="muted" className="text-xs">
        {label}
      </P>
      <P className="text-sm">{display}</P>
    </Div>
  );
}
