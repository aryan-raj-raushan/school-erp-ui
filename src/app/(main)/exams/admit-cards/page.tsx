"use client";

import { useAdmitCards } from "@/hooks/useExams";
import { ADMIT_CARDS_PAGE } from "@/constants";
import {
  Div,
  H1,
  P,
  Button,
  Select,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  Badge,
  Spinner,
  Modal,
  MiniStat,
  FilterLabel,
  Icon,
} from "@/components/ui";
import { Eye, FileText } from "lucide-react";

export default function AdmitCardsPage() {
  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    exams,
    selectedExamId,
    setSelectedExamId,
    classes,
    sections,
    selectedClassId,
    selectedSectionId,
    admitCards,
    students,
    examStudents,
    previewHtml,
    showPreviewModal,
    setShowPreviewModal,
    isLoading,
    isGenerating,
    handleClassChange,
    handleSectionChange,
    generateForClass,
    previewCard,
  } = useAdmitCards();

  function getStudentName(studentId: string) {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.first_name} ${s.last_name ?? ""}`.trim() : studentId;
  }

  const registeredInSection = examStudents.filter((es) =>
    students.some((s) => s.id === es.student_id)
  ).length;

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <H1>{ADMIT_CARDS_PAGE.title}</H1>
        {selectedSectionId && (
          <Button loading={isGenerating} onClick={generateForClass}>
            <Icon icon={FileText} type="btn-icon" />
            {ADMIT_CARDS_PAGE.generateButton}
          </Button>
        )}
      </Div>

      {/* Filters */}
      <Div variant="card" padding="p-4">
        <Div type="grid" cols={4} gap="md">
          <Div type="col" gap="xs">
            <FilterLabel>Academic Year</FilterLabel>
            <Select
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}{y.is_current ? " (Current)" : ""}
                </option>
              ))}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Exam</FilterLabel>
            <Select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={!selectedAcademicYearId}
            >
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Class</FilterLabel>
            <Select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={!selectedExamId}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Section</FilterLabel>
            <Select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">Select section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </Select>
          </Div>
        </Div>
      </Div>

      {/* Summary */}
      {selectedSectionId && (
        <Div type="row" gap="sm">
          <MiniStat label="Registered Students" value={registeredInSection} />
          <MiniStat label="Hall Tickets Generated" value={admitCards.length} color="green" />
        </Div>
      )}

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{ADMIT_CARDS_PAGE.table.student}</TableHeaderCell>
            <TableHeaderCell>{ADMIT_CARDS_PAGE.table.rollNo}</TableHeaderCell>
            <TableHeaderCell>{ADMIT_CARDS_PAGE.table.issued}</TableHeaderCell>
            <TableHeaderCell>{ADMIT_CARDS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : !selectedSectionId ? (
            <TableEmptyRow colSpan={5}>{ADMIT_CARDS_PAGE.empty}</TableEmptyRow>
          ) : admitCards.length === 0 ? (
            <TableEmptyRow colSpan={5}>{ADMIT_CARDS_PAGE.noCards}</TableEmptyRow>
          ) : (
            admitCards.map((card, i) => {
              const es = examStudents.find((e) => e.student_id === card.student_id);
              return (
                <TableRow key={card.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{getStudentName(card.student_id)}</TableCell>
                  <TableCell>{es?.roll_number ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={card.is_issued ? "success" : "default"}>
                      {card.is_issued ? "Issued" : "Not Issued"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => previewCard(card.student_id)}>
                      <Icon icon={Eye} type="sm-inline" />
                      {ADMIT_CARDS_PAGE.previewButton}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Preview Modal */}
      {showPreviewModal && (
        <Modal title="Hall Ticket Preview" onClose={() => setShowPreviewModal(false)} size="lg">
          <Div variant="preview" padding="mx-6 mb-6">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </Div>
        </Modal>
      )}
    </Div>
  );
}
