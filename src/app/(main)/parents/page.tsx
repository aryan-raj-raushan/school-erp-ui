"use client";

import { Trash2 } from "lucide-react";
import { useParents } from "@/hooks/useParents";
import {
  Div,
  P,
  Button,
  Input,
  PageHeader,
  PageCol,
  FilterBar,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  ResponsiveModalContainer,
  ResponsiveSelect,
  FormField,
  PhoneField,
  Badge,
  Spinner,
} from "@/components/ui";
import { PARENT_RELATION_OPTIONS } from "@/constants/students.constants";

const RELATION_LABEL: Record<string, string> = {
  FATHER: "Father", MOTHER: "Mother", GUARDIAN: "Guardian",
  GRANDPARENT: "Grandparent", SIBLING: "Sibling", OTHER: "Other",
};

export default function ParentsPage() {
  const {
    parents,
    pagination,
    filters,
    isLoading,
    showModal,
    openModal,
    closeModal,
    form,
    handleSubmit,
    isSubmitting,
    deleteParent,
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
    updateFilters,
  } = useParents();

  const { register, formState: { errors }, watch } = form;
  const watchedStudentId = watch("student_id");

  return (
    <PageCol>
      <PageHeader
        sticky
        title="Parents & Guardians"
        subtitle={`${pagination.total} guardian records`}
        actions={
          <Button onClick={openModal}>Add Guardian</Button>
        }
      />

      <FilterBar>
        <Input
          width="md"
          placeholder="Search by name, phone or student"
          value={filters.search ?? ""}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
        <ResponsiveSelect
          className="w-32 max-w-full"
          value={filters.relation ?? ""}
          onChange={(e) => updateFilters({ relation: e.target.value || undefined })}
          customPlaceholder="All Relations"
          options={PARENT_RELATION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <ResponsiveSelect
          className="w-32 max-w-full"
          value={filters.is_primary ?? ""}
          onChange={(e) => updateFilters({ is_primary: e.target.value || undefined })}
          customPlaceholder="All Guardians"
          options={[
            { value: "true", label: "Primary only" },
            { value: "false", label: "Non-primary" },
          ]}
        />
        <ResponsiveSelect
          className="w-32 max-w-full"
          value={filters.can_pickup ?? ""}
          onChange={(e) => updateFilters({ can_pickup: e.target.value || undefined })}
          customPlaceholder="Pickup: All"
          options={[
            { value: "true", label: "Can pickup" },
            { value: "false", label: "Cannot pickup" },
          ]}
        />
      </FilterBar>

      <Table fillViewport>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>Guardian Name</TableHeaderCell>
            <TableHeaderCell>Relation</TableHeaderCell>
            <TableHeaderCell>Phone</TableHeaderCell>
            <TableHeaderCell>Student</TableHeaderCell>
            <TableHeaderCell>Occupation</TableHeaderCell>
            <TableHeaderCell>Flags</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
          ) : parents.length === 0 ? (
            <TableEmptyRow colSpan={7}>No guardians found</TableEmptyRow>
          ) : (
            parents.map((g) => (
              <TableRow key={g.id}>
                <TableCell primary>
                  {g.first_name} {g.last_name ?? ""}
                </TableCell>
                <TableCell>
                  <Badge variant="default">{RELATION_LABEL[g.relation] ?? g.relation}</Badge>
                </TableCell>
                <TableCell>
                  {g.phone_number ? `${g.dial_code ?? ""} ${g.phone_number}` : "—"}
                </TableCell>
                <TableCell>{g.student_name}</TableCell>
                <TableCell>{g.occupation ?? "—"}</TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    {g.is_primary && <Badge variant="success">Primary</Badge>}
                    {g.can_pickup && <Badge variant="default">Pickup</Badge>}
                  </Div>
                </TableCell>
                <TableCell>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => deleteParent(g.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Guardian Modal */}
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
                    options={classes.map((c) => ({ value: c.id, label: c.name }))}
                  />
                </FormField>
                <FormField label="Section" hint="Optional — narrows the student list">
                  <ResponsiveSelect
                    value={selectedSectionId}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    disabled={!selectedClassId}
                    customPlaceholder="All sections"
                    options={sections.map((s) => ({ value: s.id, label: s.name }))}
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
                      label: `${s.first_name} ${s.last_name ?? ""} — ${s.admission_number}`,
                    }))}
                  />
                </FormField>
              </Div>

              {watchedStudentId && (
                <>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label="Relation" required error={errors.relation?.message}>
                      <ResponsiveSelect
                        {...register("relation")}
                        defaultValue="FATHER"
                        options={PARENT_RELATION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      />
                    </FormField>
                    <FormField label="First Name" required error={errors.first_name?.message}>
                      <Input placeholder="First name" {...register("first_name")} />
                    </FormField>
                    <FormField label="Last Name" error={errors.last_name?.message}>
                      <Input placeholder="Last name" {...register("last_name")} />
                    </FormField>
                    <PhoneField
                      label="Phone"
                      required
                      dialCodeProps={register("dial_code")}
                      phoneProps={register("phone_number")}
                      phoneError={errors.phone_number?.message}
                    />
                    <FormField label="Email" error={errors.email?.message}>
                      <Input type="email" placeholder="Email" {...register("email")} />
                    </FormField>
                    <FormField label="Occupation">
                      <Input placeholder="Occupation" {...register("occupation")} />
                    </FormField>
                  </Div>
                  <Div type="row" gap="lg">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" {...register("is_primary")} className="h-4 w-4 rounded" />
                      Primary guardian
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" {...register("can_pickup")} className="h-4 w-4 rounded" />
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
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={isSubmitting} disabled={!watchedStudentId}>
              Add Guardian
            </Button>
          </div>
        </form>
      </ResponsiveModalContainer>
    </PageCol>
  );
}
