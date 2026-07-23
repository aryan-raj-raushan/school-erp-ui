"use client";

import { useSearchParams } from "next/navigation";

import { Suspense } from "react";
import { useEditClass } from "@/hooks/useEditClass";
import { useClassTypeCrudSelect } from "@/hooks/useClassTypeCrudSelect";
import { CLASSES_PAGE, CLASS_SEQUENCE_OPTIONS } from "@/constants";
import {
  Div,
  Button,
  H2,
  FormField,
  Input,
  Textarea,
  CheckboxLabel,
  Spinner,
  CrudDropdown,
  PageHeader,
  ResponsiveSelect,
} from "@/components/ui";
import { useIsMobile } from "@/hooks/use-mobile";

function EditClassPageInner() {
  const isMobile = useIsMobile();
  const _searchParams = useSearchParams();
  const id = _searchParams.get("id") ?? "";

  const {
    form,
    years,
    isLoadingData,
    isSubmitting,
    allSectionNames,
    watchedSections,
    handleSubmit,
    handleBack,
    toggleSection,
    toggleIsActive,
  } = useEditClass(id);
  const {
    classTypeItems,
    isClassTypesLoading,
    addClassType,
    updateClassType,
    deleteClassType,
  } = useClassTypeCrudSelect();

  if (isLoadingData) {
    return (
      <Div type="col" align="center" justify="center" className="py-20">
        <Spinner />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      <PageHeader
        title={CLASSES_PAGE.form.editTitle}
        subtitle="Update the details of this class"
        actions={
          <Button variant="outline" onClick={handleBack}>
            {CLASSES_PAGE.form.cancel}
          </Button>
        }
        backButton={isMobile}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="lg">
          <Div
            type="col"
            gap="md"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Basic Information
            </H2>

            <FormField
              label="Academic Year *"
              error={form.formState.errors.academic_year_id?.message}
            >
              <ResponsiveSelect
                {...form.register("academic_year_id")}
                customPlaceholder="Select Academic Year"
                options={years.map((y) => ({ value: y.id, label: y.name }))}
              />
            </FormField>

            <FormField
              label={CLASSES_PAGE.form.name}
              error={form.formState.errors.name?.message}
            >
              <Input
                placeholder={CLASSES_PAGE.placeholders.name}
                {...form.register("name")}
              />
            </FormField>
          </Div>

          <Div
            type="col"
            gap="md"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Configuration
            </H2>

            <Div type="grid" cols={2} gap="md">
              <FormField
                label={CLASSES_PAGE.form.classType}
                error={form.formState.errors.class_type?.message}
              >
                <CrudDropdown
                  items={classTypeItems}
                  isLoading={isClassTypesLoading}
                  value={form.watch("class_type") ?? ""}
                  onChange={(val) =>
                    form.setValue("class_type", val, { shouldValidate: true })
                  }
                  onAdd={addClassType}
                  onUpdate={updateClassType}
                  onDelete={deleteClassType}
                  placeholder={CLASSES_PAGE.placeholders.classType}
                />
              </FormField>
              <FormField
                label={CLASSES_PAGE.form.classSequence}
                error={form.formState.errors.class_sequence?.message}
              >
                <ResponsiveSelect
                  {...form.register("class_sequence")}
                  customPlaceholder="Select"
                  options={CLASS_SEQUENCE_OPTIONS.map((n) => ({
                    value: String(n),
                    label: String(n),
                  }))}
                />
              </FormField>
            </Div>

            <Div type="grid" cols={2} gap="md">
              <FormField
                label={CLASSES_PAGE.form.noOfSessions}
                error={form.formState.errors.no_of_sessions?.message}
              >
                <Input
                  type="number"
                  min={1}
                  {...form.register("no_of_sessions")}
                />
              </FormField>
              <FormField
                label={CLASSES_PAGE.form.classCode}
                error={form.formState.errors.class_code?.message}
              >
                <Input
                  placeholder={CLASSES_PAGE.placeholders.classCode}
                  {...form.register("class_code")}
                />
              </FormField>
            </Div>

            <FormField
              label={CLASSES_PAGE.form.sections}
              error={form.formState.errors.sections?.message}
            >
              <Div type="row" gap="sm" wrap>
                {allSectionNames.map((name) => (
                  <Div key={name} type="row" align="center" gap="xs">
                    <input
                      type="checkbox"
                      id={`sec-${name}`}
                      checked={watchedSections.includes(name)}
                      onChange={() => toggleSection(name)}
                    />
                    <CheckboxLabel htmlFor={`sec-${name}`}>
                      {name}
                    </CheckboxLabel>
                  </Div>
                ))}
              </Div>
            </FormField>

            <FormField
              label={CLASSES_PAGE.form.description}
              error={form.formState.errors.description?.message}
            >
              <Textarea
                placeholder={CLASSES_PAGE.placeholders.description}
                {...form.register("description")}
              />
            </FormField>

            <Div type="row" align="center" gap="sm">
              <input
                type="checkbox"
                id="is_active"
                checked={form.watch("is_active")}
                onChange={toggleIsActive}
              />
              <CheckboxLabel htmlFor="is_active">
                {CLASSES_PAGE.form.isActive}
              </CheckboxLabel>
            </Div>
          </Div>

          <Div type="row" justify="end" gap="sm">
            <Button type="button" variant="outline" onClick={handleBack}>
              {CLASSES_PAGE.form.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {CLASSES_PAGE.form.update}
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}

export default function EditClassPage() {
  return (
    <Suspense
      fallback={
        <Div className="flex justify-center py-20">
          <Div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </Div>
      }
    >
      <EditClassPageInner />
    </Suspense>
  );
}
