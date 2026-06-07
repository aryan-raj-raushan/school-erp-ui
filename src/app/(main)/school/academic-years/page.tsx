'use client';

import { useAcademicYears } from '@/hooks/useAcademicYears';
import { ACADEMIC_YEARS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Pencil } from 'lucide-react';

export default function AcademicYearsPage() {
  const {
    years, isLoading,
    getSessionName, setCurrent,
    navigateToNew, navigateToEdit,
  } = useAcademicYears();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={ACADEMIC_YEARS_PAGE.title}
        subtitle={ACADEMIC_YEARS_PAGE.description}
        illustration="/illustrations/graduation.svg"
        actions={
          <Button onClick={navigateToNew}>
            {ACADEMIC_YEARS_PAGE.addButton}
          </Button>
        }
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.sessionCode}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.timetableSession}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.startDate}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.endDate}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
          ) : years.length === 0 ? (
            <TableEmptyRow colSpan={7}>{ACADEMIC_YEARS_PAGE.empty}</TableEmptyRow>
          ) : (
            years.map((year) => (
              <TableRow key={year.id}>
                <TableCell primary>{year.name}</TableCell>
                <TableCell>{year.session_code ?? '—'}</TableCell>
                <TableCell>{getSessionName(year.timetable_session_id)}</TableCell>
                <TableCell>{new Date(year.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(year.end_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Div type="col" gap="xs">
                    {year.is_current && (
                      <Badge variant="success">{ACADEMIC_YEARS_PAGE.status.current}</Badge>
                    )}
                    <Badge variant={year.is_enabled ? 'success' : 'default'}>
                      {year.is_enabled ? ACADEMIC_YEARS_PAGE.status.enabled : ACADEMIC_YEARS_PAGE.status.disabled}
                    </Badge>
                  </Div>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => navigateToEdit(year.id)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    {!year.is_current && (
                      <Button size="sm" variant="outline" onClick={() => setCurrent(year.id)}>
                        {ACADEMIC_YEARS_PAGE.setCurrentButton}
                      </Button>
                    )}
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
