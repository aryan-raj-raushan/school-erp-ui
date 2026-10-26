"use client";

import { useEffect, useState } from "react";
import { useSchoolConfig } from "@/hooks/useSchoolConfig";
import { SchoolProfileService } from "@/services/school-profile.service";
import { StudentsService } from "@/services/students-v2.service";
import {
  Div,
  P,
  H3,
  Input,
  Spinner,
  Switch,
  FormField,
  PageHeader,
  PageCol,
  ResponsiveSelect,
  type PageHeaderConfig,
} from "@/components/ui";

export default function AdmissionNumbersPage() {
  const { form, isLoading, isSaving, updateField, save } = useSchoolConfig();
  const [schoolCode, setSchoolCode] = useState("");
  const [issuedUpTo, setIssuedUpTo] = useState(0);

  useEffect(() => {
    SchoolProfileService.get()
      .then((school) => setSchoolCode(school.code ?? ""))
      .catch(() => setSchoolCode(""));
    StudentsService.nextNumbers({})
      .then(({ last_issued }) => setIssuedUpTo(last_issued))
      .catch(() => setIssuedUpTo(0));
  }, []);

  if (isLoading) {
    return (
      <PageCol>
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      </PageCol>
    );
  }

  const prefix = form.admission_prefix || schoolCode || "ADM";
  const digits = form.admission_number_digits ?? 5;
  const start = form.admission_start_number ?? 1;
  const year = new Date().getFullYear();
  const sample = String(Math.max(start, issuedUpTo + 1)).padStart(digits, "0");
  const preview = (form.admission_include_year ?? true) ? `${prefix}-${year}-${sample}` : `${prefix}-${sample}`;

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Admission Numbers",
    subtitle: "Admission numbers are generated automatically for every new student.",
    backButton: true,
    actions: [{ label: isSaving ? "Saving..." : "Save", onClick: () => save() }],
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      <Div variant="card" type="col" gap="md" padding="p-6">
        <H3>Format</H3>
        <Div type="grid" cols={2} gap="md">
          <FormField label="Prefix" hint={`Leave empty to use the school code${schoolCode ? ` (${schoolCode})` : ""}`}>
            <Input
              value={form.admission_prefix ?? ""}
              maxLength={15}
              placeholder={schoolCode || "CPS"}
              onChange={(e) =>
                updateField("admission_prefix", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
            />
          </FormField>
          <FormField label="Number of digits">
            <ResponsiveSelect
              value={String(digits)}
              onChange={(e) => updateField("admission_number_digits", Number(e.target.value))}
              options={[3, 4, 5, 6, 7, 8].map((d) => ({ value: String(d), label: `${d} digits` }))}
            />
          </FormField>
          <FormField
            label="Start from"
            hint={issuedUpTo > 0 ? `Numbers up to ${issuedUpTo} are already issued and never reused` : "First number to issue"}
          >
            <Input
              inputMode="numeric"
              value={String(start)}
              onChange={(e) => {
                const value = Number(e.target.value.replace(/\D/g, "").slice(0, 8));
                updateField("admission_start_number", Math.max(value, 1));
              }}
            />
          </FormField>
          <FormField label="Include year">
            <Div type="row" align="center" gap="sm" className="min-h-11">
              <Switch
                checked={form.admission_include_year ?? true}
                onCheckedChange={(checked) => updateField("admission_include_year", checked)}
              />
              <P size="sm">Add the current year, e.g. {year}</P>
            </Div>
          </FormField>
        </Div>
        <Div type="col" gap="xs" className="rounded-xl border border-border p-4">
          <P size="xs" color="muted">Next admission number will look like</P>
          <P size="lg" weight="semibold" className="font-mono">{preview}</P>
        </Div>
      </Div>
    </PageCol>
  );
}
