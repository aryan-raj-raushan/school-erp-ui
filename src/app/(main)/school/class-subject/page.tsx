"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
} from "@/components/ui";
import { useMasterSubjects } from "@/hooks/useMasterSubject";

// ─── Page constants ────────────────────────────────────────────────────────────
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
    section: "Class Section",
    subject: "Subject",
    academicYear: "Academic Year",
    type: "Subject Type",
    cancel: "Cancel",
    submit: "Assign Subject",
  },
  placeholders: {
    section: "Select section",
    subject: "Select subject",
    academicYear: "Select academic year",
  },
} as const;

// ─── Filter bar ────────────────────────────────────────────────────────────────
interface FilterBarProps {
  academicYearId: string;
  classSectionId: string;
  onAcademicYearChange: (id: string) => void;
  onClassSectionChange: (id: string) => void;
  years: { id: string; name: string }[];
  sections: { id: string; name: string; class_id: string }[];
  classes: { id: string; display_name: string }[];
}

function FilterBar({
  academicYearId,
  classSectionId,
  onAcademicYearChange,
  onClassSectionChange,
  years,
  sections,
  classes,
}: FilterBarProps) {
  return (
    <Div type="row" gap="md" align="center" wrap>
      <Div type="col" gap="xs">
        <P color="muted">Academic Year</P>
        <select
          value={academicYearId}
          onChange={(e) => onAcademicYearChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-48"
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </select>
      </Div>

      <Div type="col" gap="xs">
        <P color="muted">Section</P>
        <select
          value={classSectionId}
          onChange={(e) => onClassSectionChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-48"
        >
          <option value="">All ClassSections</option>
          {classes.map((cls) => {
            return (
              <option key={cls.id} value={cls.id}>
                {cls.display_name}
              </option>
            );
          })}
        </select>
      </Div>
    </Div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClassSubjectsPage() {
  const [filterAcademicYearId, setFilterAcademicYearId] = useState("");
  const [filterClassSectionId, setFilterClassSectionId] = useState("");

  const { years, currentYear } = useAcademicYears();
  const { classes, sections: allSections } = useClasses();

  console.log("classes : ", classes);

  const subjects = useMasterSubjects();

  const {
    classSubjects,
    isLoading,
    showModal,
    openModal,
    closeModal,
    form,
    handleSubmit,
    isSubmitting,
    removeClassSubject,
    refetch,
  } = useClassSubjects({
    class_section_id: filterClassSectionId || undefined,
    academic_year_id: filterAcademicYearId || undefined,
  });

  console.log("classSubjects: ", classSubjects);

  // Re-fetch when filters change
  const handleAcademicYearChange = (id: string) => {
    setFilterAcademicYearId(id);
  };

  const handleClassSectionChange = (id: string) => {
    setFilterClassSectionId(id);
  };

  // Helper: resolve display names from ids
  function getSectionLabel(sectionId: string) {
    const cls = classes.find((c) => c.id === sectionId);
    return cls ? `${cls.display_name}` : "--"
  }

  function getSubjectLabel(subjectId: string) {
    const sub = subjects.find((s: any) => s.id === subjectId);
    return sub?.name ?? subjectId;
  }

  function getYearLabel(yearId: string) {
    return years.find((y) => y.id === yearId)?.name ?? "—";
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={PAGE.title}
        subtitle={
          currentYear ? `Academic Year: ${currentYear.name}` : PAGE.subtitle
        }
        illustration="/illustrations/subjects.svg"
        actions={<Button onClick={openModal}>{PAGE.addButton}</Button>}
      />

      {/* Filters */}
      <FilterBar
        academicYearId={filterAcademicYearId}
        classSectionId={filterClassSectionId}
        onAcademicYearChange={handleAcademicYearChange}
        onClassSectionChange={handleClassSectionChange}
        years={years}
        sections={allSections}
        classes={classes}
      />

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
          ) : classSubjects.length === 0 ? (
            <TableEmptyRow colSpan={5}>{PAGE.empty}</TableEmptyRow>
          ) : (
            classSubjects.items.map((cs) => (
              <TableRow key={cs.id}>
                <TableCell primary>
                  {getSectionLabel(cs.class_section_id)}
                </TableCell>
                <TableCell>{getSubjectLabel(cs.subject_name)}</TableCell>
                <TableCell>{getYearLabel(cs.academic_year_id)}</TableCell>
                <TableCell>
                  <Badge variant={cs.is_teaching_subject ? "success" : "info"}>
                    {cs.is_teaching_subject ? "Teaching" : "Non-Teaching"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeClassSubject(cs.id)}
                  >
                    <Icon icon={Trash2} type="sm-danger" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Assign Modal */}
      {showModal && (
        <Modal onClose={closeModal} title={PAGE.form.title} size="md">
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                {/* Academic Year */}
                <FormField
                  label={PAGE.form.academicYear}
                  error={form.formState.errors.academic_year_id?.message}
                  htmlFor="academic_year_id"
                >
                  <Select
                    id="academic_year_id"
                    {...form.register("academic_year_id")}
                  >
                    <option value="">{PAGE.placeholders.academicYear}</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {/* Section (grouped by class) */}
                <FormField
                  label={PAGE.form.section}
                  error={form.formState.errors.class_section_id?.message}
                  htmlFor="class_section_id"
                >
                  <Select
                    id="id"
                    {...form.register("class_section_id")}
                  >
                    <option value="">{PAGE.placeholders.section}</option>
                    {classes?.map((cls) => {
                      // const clsSections = allSections.filter(
                      //   (s) => s.class_id === cls.id,
                      // );
                      // if (clsSections.length === 0) return null;
                      return (
                        <option key={cls.id} value={cls.id}>
                          {cls.display_name}
                        </option>
                      );
                    })}
                  </Select>
                </FormField>

                {/* Subject */}
                <FormField
                  label={PAGE.form.subject}
                  error={form.formState.errors.subject_id?.message}
                  htmlFor="subject_id"
                >
                  <Select id="subject_id" {...form.register("subject_id")}>
                    <option value="">{PAGE.placeholders.subject}</option>
                    {subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subject_name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {/* Subject type toggle */}
                <FormField label={PAGE.form.type} htmlFor="is_teaching_subject">
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
                {PAGE.form.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
