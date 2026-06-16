"use client";

import { useEffect, useState } from "react";

import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import {
  Div,
  H1,
  H2,
  P,
  Button,
  Input,
  Select,
  FormField,
  Spinner,
} from "@/components/ui";
import { useCreateTransferCertificate } from "@/hooks/useCertificates";
import { TRANSFER_CERT_FORM } from "@/constants/certificate.constants";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStudents } from "@/hooks/useStudentV2";

export default function CreateTransferCertificatePage() {
  const router = useRouter();

  const {students} = useStudents();

  const { form, handleSubmit, isSubmitting } = useCreateTransferCertificate();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const {
    years,
    classes,
    sections,

    selectedAcademicYearId,
    selectedClassId,
    selectedSectionId,

    setSelectedAcademicYearId,
    handleClassChange,
    handleSectionChange,

    isLoadingClasses,
  } = useAcademicClassSection();

  useEffect(() => {
    setValue("academic_year_id", selectedAcademicYearId);
  }, [selectedAcademicYearId, setValue]);

  useEffect(() => {
    setValue("class_id", selectedClassId);
  }, [selectedClassId, setValue]);

  useEffect(() => {
    setValue("section_id", selectedSectionId);
  }, [selectedSectionId, setValue]);


  async function onSubmit() {
    const result = await (handleSubmit as any)();
    if (result) {
      router.push(`/certificates/transfer/view?id=${result.id}`);
    }
  }

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} /> {TRANSFER_CERT_FORM.cancel}
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <H1>{TRANSFER_CERT_FORM.title}</H1>
          <P color="muted">{TRANSFER_CERT_FORM.subtitle}</P>
        </Div>
      </Div>

      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        <Div type="col" gap="lg">
          {/* Student Details */}
          <Div
            type="col"
            gap="md"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {TRANSFER_CERT_FORM.sections.student}
            </H2>

            <FormField
              label={TRANSFER_CERT_FORM.fields.student_id}
              error={errors.student_id?.message}
            >
              <Select {...register("student_id")}>
                <option value="">
                  {TRANSFER_CERT_FORM.placeholders.student_id}
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name ?? ""}
                  </option>
                ))}
              </Select>
            </FormField>

            <Div type="grid" cols={2} gap="md">
              <FormField
                label={TRANSFER_CERT_FORM.fields.academic_year_id}
                error={errors.academic_year_id?.message}
              >
                <Select
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                >
                  <option value="">
                    {TRANSFER_CERT_FORM.placeholders.academic_year_id}
                  </option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={TRANSFER_CERT_FORM.fields.class_id}
                error={errors.class_id?.message}
              >
                <Select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  disabled={!selectedAcademicYearId || isLoadingClasses}
                >
                  <option value="">
                    {TRANSFER_CERT_FORM.placeholders.class_id}
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={TRANSFER_CERT_FORM.fields.section_id}
                error={errors.section_id?.message}
              >
                <Select
                  value={selectedSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  disabled={!selectedClassId}
                >
                  <option value="">
                    {TRANSFER_CERT_FORM.placeholders.section_id}
                  </option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </Div>
          </Div>

          {/* Certificate Details */}
          <Div
            type="col"
            gap="md"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {TRANSFER_CERT_FORM.sections.certificate}
            </H2>

            <Div type="grid" cols={2} gap="md">
              <FormField
                label={TRANSFER_CERT_FORM.fields.qualified_for_higher_class}
                error={errors.qualified_for_higher_class?.message}
              >
                <Select {...register("qualified_for_higher_class")}>
                  {TRANSFER_CERT_FORM.options.qualified.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={TRANSFER_CERT_FORM.fields.leaving_date}
                error={errors.leaving_date?.message}
              >
                <Input
                  placeholder={TRANSFER_CERT_FORM.placeholders.leaving_date}
                  {...register("leaving_date")}
                />
              </FormField>

              <FormField
                label={TRANSFER_CERT_FORM.fields.total_working_days}
                error={errors.total_working_days?.message}
              >
                <Input
                  type="number"
                  min={0}
                  placeholder={
                    TRANSFER_CERT_FORM.placeholders.total_working_days
                  }
                  {...register("total_working_days")}
                />
              </FormField>

              <FormField
                label={TRANSFER_CERT_FORM.fields.total_present}
                error={errors.total_present?.message}
              >
                <Input
                  type="number"
                  min={0}
                  placeholder={TRANSFER_CERT_FORM.placeholders.total_present}
                  {...register("total_present")}
                />
              </FormField>

              <FormField
                label={TRANSFER_CERT_FORM.fields.candidate_character}
                error={errors.candidate_character?.message}
              >
                <Input
                  placeholder={
                    TRANSFER_CERT_FORM.placeholders.candidate_character
                  }
                  {...register("candidate_character")}
                />
              </FormField>

              <FormField
                label={TRANSFER_CERT_FORM.fields.fees_due}
                error={errors.fees_due?.message}
              >
                <Select {...register("fees_due")}>
                  {TRANSFER_CERT_FORM.options.feesDue.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </Div>

            <FormField
              label={TRANSFER_CERT_FORM.fields.leaving_reason}
              error={errors.leaving_reason?.message}
            >
              <Input
                placeholder={TRANSFER_CERT_FORM.placeholders.leaving_reason}
                {...register("leaving_reason")}
              />
            </FormField>

            <FormField
              label={TRANSFER_CERT_FORM.fields.extra_activities}
              error={errors.extra_activities?.message}
            >
              <Input
                placeholder={TRANSFER_CERT_FORM.placeholders.extra_activities}
                {...register("extra_activities")}
              />
            </FormField>
          </Div>

          {/* Actions */}
          <Div type="row" justify="end" gap="sm">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              {TRANSFER_CERT_FORM.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {TRANSFER_CERT_FORM.submit}
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
