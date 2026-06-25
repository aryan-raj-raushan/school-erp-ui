'use client';

import { useTimetablePage } from '@/hooks/useTimetablePage';
import { SCHOOL_TIMETABLE_PAGE } from '@/constants';
import {
  Div, Button,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon, Select, FilterLabel,
} from '@/components/ui';
import { Pencil, Eye, Trash2, Users, Calendar } from 'lucide-react';

export default function TimetablePage() {
  const {
    years, timetables, classes, classDetails, isLoading,
    filterAcademicYearId, setFilterAcademicYearId,
    filterClassId, setFilterClassId,
    filterClassDetailId, setFilterClassDetailId,
    removeTimetable, goToNew, goToView, goToEdit, goToEmployee, goToSession,
  } = useTimetablePage();

  return (
    <PageCol>
      <PageHeader
        title={SCHOOL_TIMETABLE_PAGE.title}
        actions={
          <>
            <Button variant="outline" onClick={goToSession}>
              <Calendar className="w-4 h-4 mr-1" />
              Day Schedule
            </Button>
            <Button variant="outline" onClick={goToEmployee}>
              <Users className="w-4 h-4 mr-1" />
              Employee Schedule
            </Button>
            <Button onClick={goToNew}>{SCHOOL_TIMETABLE_PAGE.addButton}</Button>
          </>
        }
      />

      <Div type="row" gap="md" align="end" wrap>
        <Div type="col" gap="xs">
          <FilterLabel>Academic Year</FilterLabel>
          <Select value={filterAcademicYearId} onChange={(e) => setFilterAcademicYearId(e.target.value)} width="md">
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>
            ))}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Class</FilterLabel>
          <Select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} width="md">
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Class Detail</FilterLabel>
          <Select value={filterClassDetailId} onChange={(e) => setFilterClassDetailId(e.target.value)} width="md" disabled={!filterClassId}>
            <option value="">All</option>
            {classDetails.map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
          </Select>
        </Div>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.classDetail}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.maxPeriods}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : timetables.length === 0 ? (
            <TableEmptyRow colSpan={6}>{SCHOOL_TIMETABLE_PAGE.empty}</TableEmptyRow>
          ) : (
            timetables.map((tt) => (
              <TableRow key={tt.id}>
                <TableCell primary>{tt.name}</TableCell>
                <TableCell>{tt.class_name ?? '—'}</TableCell>
                <TableCell>{tt.class_detail_name ?? '—'}</TableCell>
                <TableCell>{tt.max_periods}</TableCell>
                <TableCell>
                  <Badge variant={tt.is_complete ? 'success' : 'default'}>
                    {tt.is_complete ? 'Complete' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => goToView(tt.id)}>
                      <Icon icon={Eye} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => goToEdit(tt.id)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeTimetable(tt.id)}>
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
