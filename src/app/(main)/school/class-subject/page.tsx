"use client";

import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useClassSubjects } from "@/hooks/useClassSubject";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useClasses } from "@/hooks/useClasses";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
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
  Select,
  Badge,
  Spinner,
  Icon,
  FilterLabel,
} from "@/components/ui";
import { useMasterSubjects } from "@/hooks/useMasterSubject";
import type { ClassSectionSubject } from "@/types/setting/class-subject.types";

const PAGE = {
  title: "Class Subjects",
  subtitle: "Assign subjects to class sections",
  addButton: "Assign Subject",
  tableHeaders: {
    section: "Section",
    subject: "Subject Name",
    academicYear: "Academic Year",
    type: "Type",
    actions: "Actions",
  },
  empty: "No subjects assigned yet.",
  form: {
    title: "Assign Subject to Section",
    editTitle: "Edit Subject Assignment",
    class: "Class",
    section: "Section",
    subject: "Subject",
    academicYear: "Academic Year",
    type: "Subject Type",
    cancel: "Cancel",
    submit: "Assign Subject",
    save: "Save Changes",
  },
} as const;

export default function ClassSubjectsPage() {
  const [filterAcademicYearId, setFilterAcademicYearId] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterClassSectionId, setFilterClassSectionId] = useState("");

  // local state for modal class selection
  const [modalClassId, setModalClassId] = useState("");

  const { years, currentYear } = useAcademicYears();
  const { classes, sections: allSections } = useClasses();
  const subjects = useMasterSubjects();

  const {
    classSubjects,
    isLoading,
    showModal,
    openModal,
    openEditModal,
    closeModal,
    form,
    handleSubmit,
    isSubmitting,
    removeClassSubject,
    editingRecord,
    refetch,
  } = useClassSubjects({
    class_section_id: filterClassSectionId || undefined,
    academic_year_id: filterAcademicYearId || undefined,
  });

  // sections filtered by selected class (for filter bar and modal)
  const filterSections = filterClassId
    ? allSections.filter((s) => s.class_id === filterClassId)
    : allSections;

  const modalSections = modalClassId
    ? allSections.filter((s) => s.class_id === modalClassId)
    : allSections;

  function getSectionLabel(sectionId: string) {
    const sec = allSections.find((s) => s.id === sectionId);
    if (!sec) return sectionId;
    const cls = classes.find((c) => c.id === sec.class_id);
    return cls ? `${cls.name} — Section ${sec.name}` : `Section ${sec.name}`;
  }

  function getYearLabel(yearId: string) {
    return years.find((y) => y.id === yearId)?.name ?? "—";
  }

  function handleOpenModal() {
    setModalClassId("");
    openModal();
  }

  function handleOpenEditModal(cs: ClassSectionSubject) {
    const sectionClassId =
      allSections.find((s) => s.id === cs.class_section_id)?.class_id ?? "";
    setModalClassId(sectionClassId);
    openEditModal(cs);
  }

  function handleFilterClassChange(classId: string) {
    setFilterClassId(classId);
    setFilterClassSectionId("");
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={PAGE.title}
        subtitle={
          currentYear ? `Academic Year: ${currentYear.name}` : PAGE.subtitle
        }
        illustration="/illustrations/subjects.svg"
        actions={<Button onClick={handleOpenModal}>{PAGE.addButton}</Button>}
      />

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <Div type="col" gap="xs">
          <FilterLabel>Academic Year</FilterLabel>
          <Select
            value={filterAcademicYearId}
            onChange={(e) => setFilterAcademicYearId(e.target.value)}
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Class</FilterLabel>
          <Select
            value={filterClassId}
            onChange={(e) => handleFilterClassChange(e.target.value)}
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name}
              </option>
            ))}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Section</FilterLabel>
          <Select
            value={filterClassSectionId}
            onChange={(e) => setFilterClassSectionId(e.target.value)}
            disabled={!filterClassId}
          >
            <option value="">All sections</option>
            {filterSections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </Select>
        </Div>
      </Div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{PAGE.tableHeaders.section}</TableHeaderCell>
            <TableHeaderCell>{PAGE.tableHeaders.subject}</TableHeaderCell>
            <TableHeaderCell>{PAGE.tableHeaders.academicYear}</TableHeaderCell>
            <TableHeaderCell>{PAGE.tableHeaders.type}</TableHeaderCell>
            <TableHeaderCell>{PAGE.tableHeaders.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}>
              <Spinner />
            </TableEmptyRow>
          ) : !classSubjects?.data?.items?.length ? (
            <TableEmptyRow colSpan={5}>{PAGE.empty}</TableEmptyRow>
          ) : (
            classSubjects.data.items.map((cs) => (
              <TableRow key={cs.id}>
                <TableCell primary>{getSectionLabel(cs.class_section_id)}</TableCell>
                <TableCell>{cs.subject_name}</TableCell>
                <TableCell>{getYearLabel(cs.academic_year_id)}</TableCell>
                <TableCell>
                  <Badge variant={cs.is_teaching_subject ? "success" : "info"}>
                    {cs.is_teaching_subject ? "Teaching" : "Non-Teaching"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEditModal(cs)}
                    >
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeClassSubject(cs.id)}
                    >
                      <Icon icon={Trash2} type="sm-danger" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Assign / Edit Modal */}
      {showModal && (
        <Modal
          onClose={closeModal}
          title={editingRecord ? PAGE.form.editTitle : PAGE.form.title}
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                {/* Academic Year */}
                <FormField
                  label={PAGE.form.academicYear}
                  error={form.formState.errors.academic_year_id?.message}
                >
                  <Select {...form.register("academic_year_id")}>
                    <option value="">Select academic year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {/* Class (local state — not in form, used to filter sections) */}
                <FormField label={PAGE.form.class}>
                  <Select
                    value={modalClassId}
                    onChange={(e) => {
                      setModalClassId(e.target.value);
                      form.setValue("class_section_id", "");
                    }}
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {/* Section (filtered by class) */}
                <FormField
                  label={PAGE.form.section}
                  error={form.formState.errors.class_section_id?.message}
                >
                  <Select
                    {...form.register("class_section_id")}
                    disabled={!modalClassId}
                  >
                    <option value="">Select section</option>
                    {modalSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        Section {s.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {/* Subject */}
                <FormField
                  label={PAGE.form.subject}
                  error={form.formState.errors.subject_id?.message}
                >
                  <Select {...form.register("subject_id")}>
                    <option value="">Select subject</option>
                    {subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subject_name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {/* Subject type */}
                <FormField label={PAGE.form.type}>
                  <Div type="row" gap="md" align="center">
                    <input
                      type="checkbox"
                      id="is_teaching_subject"
                      {...form.register("is_teaching_subject")}
                    />
                    <label
                      htmlFor="is_teaching_subject"
                      className="text-sm text-foreground/80"
                    >
                      Teaching Subject
                    </label>
                  </Div>
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                {PAGE.form.cancel}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editingRecord ? PAGE.form.save : PAGE.form.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
