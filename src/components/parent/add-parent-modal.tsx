"use client";

import type { UseFormReturn } from "react-hook-form";
import type { GuardianFormValues } from "@/hooks/useParents";
import {
  Div,
  P,
  Button,
  Input,
  ResponsiveModalContainer,
  ResponsiveSelect,
  FormField,
  PhoneField,
} from "../ui";
import { PARENT_RELATION_OPTIONS } from "@/constants/students.constants";

interface Option {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  first_name: string;
  last_name?: string | null;
  admission_number: string | null;
}

export interface AddParentModalProps {
  showModal: boolean;
  closeModal: () => void;
  form: UseFormReturn<GuardianFormValues>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  years: Array<{ id: string; name: string; is_current?: boolean }>;
  classes: Option[];
  sections: Option[];
  selectedYearId: string;
  selectedClassId: string;
  selectedSectionId: string;
  handleYearChange: (id: string) => void;
  handleClassChange: (id: string) => void;
  handleSectionChange: (id: string) => void;
  students: StudentOption[];
  studentsLoading: boolean;
}

export default function AddParentModal({
  showModal,
  closeModal,
  form,
  handleSubmit,
  isSubmitting,
  years,
  classes,
  sections,
  selectedYearId,
  selectedClassId,
  selectedSectionId,
  handleYearChange,
  handleClassChange,
  handleSectionChange,
  students,
  studentsLoading,
}: AddParentModalProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = form;
  const watchedStudentId = watch("student_id");

  return (
    <ResponsiveModalContainer
      isOpen={showModal}
      onClose={closeModal}
      title="Add Guardian / Parent"
    >
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-4">
          <Div type="col" gap="md">
            {/* Narrow down to a student via Year → Class → Section, then pick the student */}
            <Div type="grid" cols={2} gap="md">
              <FormField label="Academic Year" required>
                <ResponsiveSelect
                  value={selectedYearId}
                  onChange={(e) => handleYearChange(e.target.value)}
                  customPlaceholder="Select academic year"
                  options={years.map((y) => ({
                    value: y.id,
                    label: `${y.name}${y.is_current ? " (Current)" : ""}`,
                  }))}
                />
              </FormField>
              <FormField label="Class" required>
                <ResponsiveSelect
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  disabled={!selectedYearId}
                  customPlaceholder="Select class"
                  options={classes.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </FormField>
              <FormField
                label="Section"
                hint="Optional — narrows the student list"
              >
                <ResponsiveSelect
                  value={selectedSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  disabled={!selectedClassId}
                  customPlaceholder="All sections"
                  options={sections.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </FormField>
              <FormField
                label="Student"
                required
                error={errors.student_id?.message}
              >
                <ResponsiveSelect
                  {...register("student_id")}
                  disabled={!selectedClassId}
                  defaultValue=""
                  customPlaceholder={
                    studentsLoading
                      ? "Loading students…"
                      : selectedClassId
                        ? "Select student"
                        : "Select a class first"
                  }
                  options={students.map((s) => ({
                    value: s.id,
                    label: `${s.first_name} ${s.last_name ?? ""} — ${
                      s.admission_number
                    }`,
                  }))}
                />
              </FormField>
            </Div>

            {watchedStudentId && (
              <>
                <Div type="grid" cols={2} gap="md">
                  <FormField
                    label="Relation"
                    required
                    error={errors.relation?.message}
                  >
                    <ResponsiveSelect
                      {...register("relation")}
                      defaultValue="FATHER"
                      options={PARENT_RELATION_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                    />
                  </FormField>
                  <FormField
                    label="First Name"
                    required
                    error={errors.first_name?.message}
                  >
                    <Input
                      placeholder="First name"
                      {...register("first_name")}
                    />
                  </FormField>
                  <FormField
                    label="Last Name"
                    error={errors.last_name?.message}
                  >
                    <Input
                      placeholder="Last name"
                      {...register("last_name")}
                    />
                  </FormField>
                  <PhoneField
                    label="Phone"
                    required
                    dialCodeProps={register("dial_code")}
                    phoneProps={register("phone_number")}
                    phoneError={errors.phone_number?.message}
                  />
                  <FormField label="Email" error={errors.email?.message}>
                    <Input
                      type="email"
                      placeholder="Email"
                      {...register("email")}
                    />
                  </FormField>
                  <FormField label="Occupation">
                    <Input
                      placeholder="Occupation"
                      {...register("occupation")}
                    />
                  </FormField>
                </Div>
                <Div type="row" gap="lg" wrap>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      {...register("is_primary")}
                      className="h-4 w-4 rounded"
                    />
                    Primary guardian
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      {...register("can_pickup")}
                      className="h-4 w-4 rounded"
                    />
                    Can pickup
                  </label>
                </Div>
              </>
            )}

            {!watchedStudentId && (
              <P color="muted" className="text-center text-sm py-2">
                Select a student above to fill in guardian details
              </P>
            )}
          </Div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!watchedStudentId}
          >
            Add Guardian
          </Button>
        </div>
      </form>
    </ResponsiveModalContainer>
  );
}
