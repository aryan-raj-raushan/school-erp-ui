"use client";

import { useClasses } from "@/hooks/useClasses";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { CLASSES_PAGE } from "@/constants";
import {
  Div,
  P,
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
  PageHeaderConfig,
} from "@/components/ui";
import { Trash2, Pencil } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ClassesPage() {
  const isMobile = useIsMobile();
  const { years } = useAcademicYears();
  const {
    classes,
    isLoading,
    sectionsForClass,
    removeClass,
    navigateToNew,
    navigateToEdit,
  } = useClasses();

  const pageHeaderConfig: PageHeaderConfig = {
    title: CLASSES_PAGE.title,
    actions: [
      {
        label: CLASSES_PAGE.addClassButton,
        onClick: () => navigateToNew(),
      },
    ],
    backButton: isMobile,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{CLASSES_PAGE.classTable.name}</TableHeaderCell>
            <TableHeaderCell>
              {CLASSES_PAGE.classTable.academicYear}
            </TableHeaderCell>
            <TableHeaderCell>
              {CLASSES_PAGE.classTable.classType}
            </TableHeaderCell>
            <TableHeaderCell>
              {CLASSES_PAGE.classTable.sections}
            </TableHeaderCell>
            <TableHeaderCell>{CLASSES_PAGE.classTable.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}>
              <Spinner />
            </TableEmptyRow>
          ) : classes.length === 0 ? (
            <TableEmptyRow colSpan={5}>{CLASSES_PAGE.classEmpty}</TableEmptyRow>
          ) : (
            classes.map((cls) => {
              const clsSections = sectionsForClass(cls.id);
              const year = years.find((y) => y.id === cls.academic_year_id);
              return (
                <TableRow key={cls.id}>
                  <TableCell primary>{cls.name}</TableCell>
                  <TableCell>{year?.name ?? "—"}</TableCell>
                  <TableCell>{cls.class_type ?? "—"}</TableCell>
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
                        onClick={() => navigateToEdit(cls.id)}
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
    </PageCol>
  );
}
