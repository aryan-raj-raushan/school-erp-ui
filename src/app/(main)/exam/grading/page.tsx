"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExamGrading } from "@/hooks/exam/useExamGrading";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div, Button, Badge, Spinner,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell, TableEmptyRow,
} from "@/components/ui";
import { GRADING_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

function GradingContent() {
  const router = useRouter();
  const { grades, isLoading, remove } = useExamGrading();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={GRADING_PAGE.pageHeading.title}
        subtitle={GRADING_PAGE.pageHeading.subtitle}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.grading.create)}>
            <Plus size={16} /> {GRADING_PAGE.buttons.add}
          </Button>
        }
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{GRADING_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{GRADING_PAGE.table.gradeName}</TableHeaderCell>
            <TableHeaderCell>{GRADING_PAGE.table.fromPct}</TableHeaderCell>
            <TableHeaderCell>{GRADING_PAGE.table.toPct}</TableHeaderCell>
            <TableHeaderCell>{GRADING_PAGE.table.seqIndex}</TableHeaderCell>
            <TableHeaderCell>{GRADING_PAGE.table.description}</TableHeaderCell>
            <TableHeaderCell>{GRADING_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{GRADING_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={8}><Spinner /></TableEmptyRow>
          ) : grades.length === 0 ? (
            <TableEmptyRow colSpan={8}>{GRADING_PAGE.table.noEntry}</TableEmptyRow>
          ) : (
            grades.map((g, i) => (
              <TableRow key={g.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary className="font-bold text-base">{g.grade_name}</TableCell>
                <TableCell>{g.from_percentage}%</TableCell>
                <TableCell>{g.to_percentage}%</TableCell>
                <TableCell>{g.sequence_index}</TableCell>
                <TableCell>{g.description ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={g.is_enabled ? "success" : "default"}>
                    {g.is_enabled ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="icon-sm" variant="ghost" title="Edit"
                      onClick={() => router.push(EXAM_ROUTES.grading.edit(g.id))}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon-sm" variant="destructive" title="Delete"
                      onClick={() => remove(g.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Div>
  );
}

export default function GradingPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <GradingContent />
    </Suspense>
  );
}