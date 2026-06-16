"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Div,
  H1,
  H2,
  P,
  Button,
  Input,
  Select,
  FormField,
} from "@/components/ui";
import { BONAFIDE_CERT_FORM } from "@/constants/certificate.constants";
import { useCreateBonafideCertificate } from "@/hooks/useCertificates";
import { useStudents } from "@/hooks";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";

export default function CreateBonafideCertificatePage() {
  const router = useRouter();
  const { students } = useStudents();

  const { form, handleSubmit, isSubmitting } = useCreateBonafideCertificate();
  const {
    register,
    formState: { errors },
    watch,
    setValue
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
      router.push(`/certificates/bonafide/view?id=${result.id}`);
    }
  }

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} /> {BONAFIDE_CERT_FORM.cancel}
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <H1>{BONAFIDE_CERT_FORM.title}</H1>
          <P color="muted">{BONAFIDE_CERT_FORM.subtitle}</P>
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
              {BONAFIDE_CERT_FORM.sections.student}
            </H2>

            <FormField
              label={BONAFIDE_CERT_FORM.fields.student_id}
              error={errors.student_id?.message}
            >
              <Select {...register("student_id")}>
                <option value="">
                  {BONAFIDE_CERT_FORM.placeholders.student_id}
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
                label={BONAFIDE_CERT_FORM.fields.academic_year_id}
                error={errors.academic_year_id?.message}
              >
                <Select
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                >
                  <option value="">
                    {BONAFIDE_CERT_FORM.placeholders.academic_year_id}
                  </option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={BONAFIDE_CERT_FORM.fields.class_id}
                error={errors.class_id?.message}
              >
                <Select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  disabled={!selectedAcademicYearId || isLoadingClasses}
                >
                  <option value="">
                    {BONAFIDE_CERT_FORM.placeholders.class_id}
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={BONAFIDE_CERT_FORM.fields.section_id}
                error={errors.section_id?.message}
              >
               <Select
                  value={selectedSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  disabled={!selectedClassId}
                >
                  <option value="">
                    {BONAFIDE_CERT_FORM.placeholders.section_id}
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
              {BONAFIDE_CERT_FORM.sections.certificate}
            </H2>

            <FormField
              label={BONAFIDE_CERT_FORM.fields.purpose}
              error={errors.purpose?.message}
            >
              <Input
                placeholder={BONAFIDE_CERT_FORM.placeholders.purpose}
                {...register("purpose")}
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
              {BONAFIDE_CERT_FORM.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {BONAFIDE_CERT_FORM.submit}
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
