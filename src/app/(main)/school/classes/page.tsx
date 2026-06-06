"use client";

import { useClasses, DEFAULT_SECTION_NAMES } from "@/hooks/useClasses";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { CLASSES_PAGE } from "@/constants";
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
  Input,
  Select,
  Badge,
  Spinner,
  CheckboxLabel,
  Icon,
} from "@/components/ui";
import { Trash2, Pencil } from "lucide-react";

export default function ClassesPage() {
  const { years, currentYear } = useAcademicYears();
  const {
    classes,
    sections,
    isLoading,
    isEditing,
    showClassModal,
    openClassModal,
    closeClassModal,
    classForm,
    handleClassSubmit,
    isClassSubmitting,
    removeClass,
    sectionsForClass,
    openEditClassModal,
  } = useClasses();

  const watchedSections = classForm.watch("sections") ?? [];

  function toggleSection(name: string) {
    const current = classForm.getValues("sections") ?? [];
    if (current.includes(name)) {
      classForm.setValue(
        "sections",
        current.filter((s) => s !== name),
        { shouldValidate: true },
      );
    } else {
      classForm.setValue("sections", [...current, name], {
        shouldValidate: true,
      });
    }
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={CLASSES_PAGE.title}
        subtitle={
          currentYear
            ? `Academic Year: ${currentYear.name}`
            : "No current academic year set"
        }
        illustration="/illustrations/graduation.svg"
        actions={
          <Button onClick={() => openClassModal(currentYear?.id)}>
            {CLASSES_PAGE.addClassButton}
          </Button>
        }
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{CLASSES_PAGE.classTable.name}</TableHeaderCell>
            <TableHeaderCell>{CLASSES_PAGE.classTable.academicYear}</TableHeaderCell>
            <TableHeaderCell>Sections</TableHeaderCell>
            <TableHeaderCell>{CLASSES_PAGE.classTable.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={4}>
              <Spinner />
            </TableEmptyRow>
          ) : classes.length === 0 ? (
            <TableEmptyRow colSpan={4}>{CLASSES_PAGE.classEmpty}</TableEmptyRow>
          ) : (
            classes.map((cls) => {
              const clsSections = sectionsForClass(cls.id);
              const year = years.find((y) => y.id === cls.academic_year_id);
              return (
                <TableRow key={cls.id}>
                  <TableCell primary>{cls.display_name}</TableCell>
                  <TableCell>{year?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Div type="row" gap="xs" wrap>
                      {clsSections.length === 0 ? (
                        <P size="xs">—</P>
                      ) : (
                        clsSections.map((s) => (
                          <Badge key={s.id} variant="info">
                            {cls.name} — {s.name}
                          </Badge>
                        ))
                      )}
                    </Div>
                  </TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditClassModal(cls)}
                      >
                        <Icon icon={Pencil} type="sm" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeClass(cls.id)}
                      >
                        <Icon icon={Trash2} type="sm-danger" />
                      </Button>
                    </Div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {showClassModal && (
        <Modal
          onClose={closeClassModal}
          title={isEditing ? "Edit Class" : CLASSES_PAGE.classForm.title}
          size="md"
        >
          <form onSubmit={handleClassSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField
                  label={CLASSES_PAGE.classForm.name}
                  error={classForm.formState.errors.name?.message}
                >
                  <Input
                    placeholder={CLASSES_PAGE.placeholders.className}
                    {...classForm.register("name")}
                  />
                </FormField>
                {!isEditing && (
                  <FormField
                    label={CLASSES_PAGE.classForm.academicYear}
                    error={classForm.formState.errors.academic_year_id?.message}
                  >
                    <Select {...classForm.register("academic_year_id")}>
                      <option value="">Select academic year</option>
                      {years.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                )}
                <FormField label={CLASSES_PAGE.classForm.description}>
                  <Input
                    placeholder="Optional description"
                    {...classForm.register("description")}
                  />
                </FormField>
                {/* Section checkboxes */}
                <FormField
                  label="Sections (select which to create)"
                  error={classForm.formState.errors.sections?.message}
                >
                  <Div type="row" gap="md" wrap>
                    {DEFAULT_SECTION_NAMES.map((name) => (
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
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeClassModal}>
                {CLASSES_PAGE.classForm.cancel}
              </Button>
              <Button type="submit" loading={isClassSubmitting}>
                {isEditing ? "Save Changes" : CLASSES_PAGE.classForm.submit}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
