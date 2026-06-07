'use client';

import { useClassDetails } from '@/hooks/useClassDetails';
import { useClasses } from '@/hooks/useClasses';
import { useTimetableSessions } from '@/hooks/useTimetableSessions';
import { CLASS_DETAILS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

export default function ClassDetailsPage() {
  const { classDetails, isLoading, removeClassDetail, navigateToNew, navigateToEdit } = useClassDetails();
  const { classes } = useClasses();
  const { sessions } = useTimetableSessions();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={CLASS_DETAILS_PAGE.title}
        subtitle="Manage class detail configurations"
        actions={<Button onClick={navigateToNew}>{CLASS_DETAILS_PAGE.addButton}</Button>}
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.session}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.year}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.classCode}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.maxExams}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.bestExams}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.electives}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.enabled}</TableHeaderCell>
            <TableHeaderCell>{CLASS_DETAILS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={10}><Spinner /></TableEmptyRow>
          ) : classDetails.length === 0 ? (
            <TableEmptyRow colSpan={10}>{CLASS_DETAILS_PAGE.empty}</TableEmptyRow>
          ) : (
            classDetails.map((detail) => {
              const cls = classes.find((c) => c.id === detail.class_id);
              const session = sessions.find((s) => s.id === detail.timetable_session_id);
              return (
                <TableRow key={detail.id}>
                  <TableCell primary>{cls?.name ?? '—'}</TableCell>
                  <TableCell>{detail.name}</TableCell>
                  <TableCell>{session?.name ?? '—'}</TableCell>
                  <TableCell>{detail.year ?? '—'}</TableCell>
                  <TableCell>{detail.class_code ?? '—'}</TableCell>
                  <TableCell>{detail.max_internal_exam}</TableCell>
                  <TableCell>{detail.best_internal_exam_count}</TableCell>
                  <TableCell>{detail.no_of_elective_subjects}</TableCell>
                  <TableCell>
                    <Badge variant={detail.is_enabled ? 'success' : 'default'}>
                      {detail.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button size="sm" variant="ghost" onClick={() => navigateToEdit(detail.id)}>
                        <Icon icon={Pencil} type="sm" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeClassDetail(detail.id)}>
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
    </Div>
  );
}
