"use client";

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
  Badge,
  Spinner,
} from "@/components/ui";
import { PARENT_RELATION_OPTIONS } from "@/constants/students-v2.constants";

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
    students,
    studentsLoading,
    updateFilters,
  } = useParents();

  const { register, formState: { errors }, watch } = form;
  const watchedStudentId = watch("student_id");

  return (
    <PageCol>
      <PageHeader
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
      </FilterBar>

      <Table>
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
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteParent(g.id)}
                  >
                    Remove
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
                {/* Student selection first */}
                <FormField
                  label="Student *"
                  error={errors.student_id?.message}
                >
                  <Select {...register("student_id")} defaultValue="">
                    <option value="">{studentsLoading ? "Loading students…" : "Select student"}</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name ?? ""} — {s.admission_number}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {watchedStudentId && (
                  <>
                    <Div type="grid" cols={2} gap="md">
                      <FormField label="Relation *" error={errors.relation?.message}>
                        <Select {...register("relation")} defaultValue="FATHER">
                          {PARENT_RELATION_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="First Name *" error={errors.first_name?.message}>
                        <Input placeholder="First name" {...register("first_name")} />
                      </FormField>
                      <FormField label="Last Name" error={errors.last_name?.message}>
                        <Input placeholder="Last name" {...register("last_name")} />
                      </FormField>
                      <FormField label="Phone *" error={errors.phone_number?.message}>
                        <Div type="row" gap="xs">
                          <Input width="xs" placeholder="+91" {...register("dial_code")} />
                          <Input placeholder="Phone number" {...register("phone_number")} />
                        </Div>
                      </FormField>
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
