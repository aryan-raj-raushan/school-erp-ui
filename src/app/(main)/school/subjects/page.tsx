"use client";

import { useSubjectsPage } from "@/hooks/useSubjectsPage";
import { SUBJECTS_PAGE } from "@/constants";
import {
  Div,
  Button,
  PageHeader,
  PageCol,
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
  Icon,
  Select,
  FilterLabel,
} from "@/components/ui";
import { Pencil, Trash2 } from "lucide-react";

export default function SubjectsPage() {
  const {
    subjects,
    classes,
    classDetails,
    isLoading,
    filterClassId,
    setFilterClassId,
    filterClassDetailId,
    setFilterClassDetailId,
    removeSubject,
    navigateToNew,
    navigateToEdit,
    getClassName,
  } = useSubjectsPage();

console.log("subjects: ", subjects);

  return (
    <PageCol>
      <PageHeader
        title={SUBJECTS_PAGE.title}
        actions={
          <Button onClick={navigateToNew}>{SUBJECTS_PAGE.addButton}</Button>
        }
      />

      <Div type="row" gap="md" align="end" wrap>
        <Div type="col" gap="xs">
          <FilterLabel>Class</FilterLabel>
          <Select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            width="md"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Class (Year / Semester)</FilterLabel>
          <Select
            value={filterClassDetailId}
            onChange={(e) => setFilterClassDetailId(e.target.value)}
            width="md"
            disabled={!filterClassId}
          >
            <option value="">All</option>
            {classDetails.map((cd) => (
              <option key={cd.id} value={cd.id}>
                {cd.name}
              </option>
            ))}
          </Select>
        </Div>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SUBJECTS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{SUBJECTS_PAGE.table.code}</TableHeaderCell>
            <TableHeaderCell>Class</TableHeaderCell>
            <TableHeaderCell>
              {SUBJECTS_PAGE.table.displayOrder}
            </TableHeaderCell>
            <TableHeaderCell>{SUBJECTS_PAGE.table.totalMarks}</TableHeaderCell>
            <TableHeaderCell>
              {SUBJECTS_PAGE.table.passingMarks}
            </TableHeaderCell>
            <TableHeaderCell>{SUBJECTS_PAGE.table.enabled}</TableHeaderCell>
            <TableHeaderCell>{SUBJECTS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={8}>
              <Spinner />
            </TableEmptyRow>
          ) : subjects.length === 0 ? (
            <TableEmptyRow colSpan={8}>{SUBJECTS_PAGE.empty}</TableEmptyRow>
          ) : (
            subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell primary>{subject.name}</TableCell>
                <TableCell>{subject.code ?? "—"}</TableCell>
                <TableCell>{getClassName(subject.class_id)}</TableCell>
                <TableCell>{subject.display_order}</TableCell>
                <TableCell>{subject.total_marks}</TableCell>
                <TableCell>{subject.passing_marks}</TableCell>
                <TableCell>
                  <Badge variant={subject.is_active ? "success" : "default"}>
                    {subject.is_active ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigateToEdit(subject.id)}
                    >
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSubject(subject.id)}
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
    </PageCol>
  );
}
