"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, GraduationCap, MapPin, UserRound } from "lucide-react";
import {
  FieldRow,
  FormGroup,
  MobileSelectField,
  MobileTextField,
  MultiStepForm,
  PhotoHero,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useStepper } from "@/hooks/useStepper";
import type { UpdateSchoolProfilePayload } from "@/services/school-profile.service";
import {
  BOARD_TYPE_OPTIONS,
  MARKING_SYSTEM_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/constants/school-profile.constants";

const STEPS = [
  { id: "basics", label: "School" },
  { id: "academic", label: "Academic" },
  { id: "contact", label: "Contact" },
  { id: "principal", label: "Principal" },
] as const;

export interface SchoolProfileMobileFormProps {
  form: UpdateSchoolProfilePayload;
  updateField: <K extends keyof UpdateSchoolProfilePayload>(
    key: K,
    value: UpdateSchoolProfilePayload[K],
  ) => void;
  isSaving: boolean;
  onSave: () => Promise<unknown> | unknown;
  uploadLogo: (file: File) => Promise<void>;
}

export function SchoolProfileMobileForm({
  form,
  updateField,
  isSaving,
  onSave,
  uploadLogo,
}: SchoolProfileMobileFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const stepper = useStepper(STEPS);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadLogo(file);
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <MultiStepForm
      title="School profile"
      steps={stepper.progress}
      activeId={stepper.activeId}
      onSelectStep={stepper.goTo}
      isFirst={stepper.isFirst}
      isLast={stepper.isLast}
      onBack={stepper.back}
      onNext={stepper.next}
      onSubmit={onSave}
      submitLabel="Save profile"
      isSubmitting={isSaving}
      quickSave
    >
      <StepPanel id="basics">
        <StepHeader
          icon={<Building2 size={22} />}
          title="About the school"
          description="Name, identity and logo."
        />
        <PhotoHero
          url={form.logo_url || null}
          name={form.name ?? ""}
          isUploading={isUploading}
          onFileChange={handleLogoChange}
        />
        <FormGroup>
          <MobileTextField
            label="School name"
            autoCapitalize="words"
            placeholder="Delhi Public School"
            value={form.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
          />
          <FieldRow>
            <MobileTextField
              label="School code"
              placeholder="DPS"
              value={form.code ?? ""}
              onChange={(e) => updateField("code", e.target.value)}
            />
            <MobileTextField
              label="Established"
              type="number"
              inputMode="numeric"
              placeholder="1995"
              value={form.established_year ?? ""}
              onChange={(e) =>
                updateField(
                  "established_year",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            />
          </FieldRow>
          <MobileTextField
            label="UDISE code"
            placeholder="27050101101"
            value={form.udise_code ?? ""}
            onChange={(e) => updateField("udise_code", e.target.value)}
          />
          <MobileTextField
            label="Affiliation number"
            placeholder="530/2022"
            value={form.affiliation_number ?? ""}
            onChange={(e) => updateField("affiliation_number", e.target.value)}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="academic">
        <StepHeader
          icon={<GraduationCap size={22} />}
          title="Academic setup"
          description="Board, marking and time zone."
        />
        <FormGroup>
          <MobileSelectField
            label="Board type"
            placeholder="Select board"
            value={form.board_type ?? ""}
            onChange={(value) => updateField("board_type", value)}
            options={BOARD_TYPE_OPTIONS}
          />
          <MobileSelectField
            label="Marking system"
            placeholder="Select system"
            value={form.marking_system ?? ""}
            onChange={(value) => updateField("marking_system", value)}
            options={MARKING_SYSTEM_OPTIONS}
          />
          <MobileSelectField
            label="Timezone"
            value={form.timezone ?? "Asia/Kolkata"}
            onChange={(value) => updateField("timezone", value)}
            options={TIMEZONE_OPTIONS}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="contact">
        <StepHeader
          icon={<MapPin size={22} />}
          title="Contact & location"
          description="How people reach and find the school."
        />
        <FormGroup title="Contact">
          <MobileTextField
            label="Email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            placeholder="info@school.edu.in"
            value={form.email ?? ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
          <MobileTextField
            label="Contact number"
            type="tel"
            inputMode="tel"
            placeholder="9876543210"
            value={form.contact_number ?? ""}
            onChange={(e) => updateField("contact_number", e.target.value)}
          />
          <MobileTextField
            label="Website"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            placeholder="https://school.edu.in"
            value={form.website ?? ""}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </FormGroup>
        <FormGroup title="Address">
          <MobileTextField
            label="Address"
            placeholder="123, MG Road"
            value={form.address ?? ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
          <FieldRow>
            <MobileTextField
              label="City"
              value={form.city ?? ""}
              onChange={(e) => updateField("city", e.target.value)}
            />
            <MobileTextField
              label="State"
              value={form.state ?? ""}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </FieldRow>
          <MobileTextField
            label="Pincode"
            inputMode="numeric"
            placeholder="110001"
            value={form.pincode ?? ""}
            onChange={(e) => updateField("pincode", e.target.value)}
          />
          <FieldRow>
            <MobileTextField
              label="Latitude"
              type="number"
              inputMode="decimal"
              value={form.lat ?? ""}
              onChange={(e) => updateField("lat", e.target.value)}
            />
            <MobileTextField
              label="Longitude"
              type="number"
              inputMode="decimal"
              value={form.lng ?? ""}
              onChange={(e) => updateField("lng", e.target.value)}
            />
          </FieldRow>
        </FormGroup>
      </StepPanel>

      <StepPanel id="principal">
        <StepHeader
          icon={<UserRound size={22} />}
          title="Principal"
          description="Who leads the school."
        />
        <FormGroup>
          <MobileTextField
            label="Principal name"
            autoCapitalize="words"
            placeholder="Dr. Rajesh Kumar"
            value={form.principal_name ?? ""}
            onChange={(e) => updateField("principal_name", e.target.value)}
          />
          <MobileTextField
            label="Principal email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            placeholder="principal@school.edu.in"
            value={form.principal_email ?? ""}
            onChange={(e) => updateField("principal_email", e.target.value)}
          />
          <MobileTextField
            label="Principal phone"
            type="tel"
            inputMode="tel"
            placeholder="9876543210"
            value={form.principal_phone ?? ""}
            onChange={(e) => updateField("principal_phone", e.target.value)}
          />
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}
