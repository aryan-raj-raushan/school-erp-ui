"use client";

import { Trash2 } from "lucide-react";
import { useParents } from "@/hooks/useParents";
import {
  Div,
  P,
  Button,
  Input,
  Select,
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
  Modal,
  ModalBody,
  ModalFooter,
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
        <Select
          width="sm"
          value={filters.relation ?? ""}
          onChange={(e) => updateFilters({ relation: e.target.value || undefined })}
        >
          <option value="">All Relations</option>
          {PARENT_RELATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.is_primary ?? ""}
          onChange={(e) => updateFilters({ is_primary: e.target.value || undefined })}
        >
          <option value="">All Guardians</option>
          <option value="true">Primary only</option>
          <option value="false">Non-primary</option>
        </Select>
        <Select
          width="sm"
          value={filters.can_pickup ?? ""}
          onChange={(e) => updateFilters({ can_pickup: e.target.value || undefined })}
        >
          <option value="">Pickup: All</option>
          <option value="true">Can pickup</option>
          <option value="false">Cannot pickup</option>
        </Select>
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
      {showModal && (
        <Modal onClose={closeModal} title="Add Guardian / Parent">
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                {/* Narrow down to a student via Year → Class → Section, then pick the student */}
                <Div type="grid" cols={2} gap="md">
                  <FormField label="Academic Year" required>
                    <Select
                      value={selectedYearId}
                      onChange={(e) => handleYearChange(e.target.value)}
                    >
                      <option value="">Select academic year</option>
                      {years.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name}
                          {y.is_current ? " (Current)" : ""}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Class" required>
                    <Select
                      value={selectedClassId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      disabled={!selectedYearId}
                    >
                      <option value="">Select class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Section" hint="Optional — narrows the student list">
                    <Select
                      value={selectedSectionId}
                      onChange={(e) => handleSectionChange(e.target.value)}
                      disabled={!selectedClassId}
                    >
                      <option value="">All sections</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField
                    label="Student"
                    required
                    error={errors.student_id?.message}
                  >
                    <Select
                      {...register("student_id")}
                      disabled={!selectedClassId}
                      defaultValue=""
                    >
                      <option value="">
                        {studentsLoading
                          ? "Loading students…"
                          : selectedClassId
                            ? "Select student"
                            : "Select a class first"}
                      </option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name ?? ""} — {s.admission_number}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </Div>

                {watchedStudentId && (
                  <>
                    <Div type="grid" cols={2} gap="md">
                      <FormField label="Relation" required error={errors.relation?.message}>
                        <Select {...register("relation")} defaultValue="FATHER">
                          {PARENT_RELATION_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </Select>
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
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
              <Button type="submit" loading={isSubmitting} disabled={!watchedStudentId}>
                Add Guardian
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageCol>
  );
}
