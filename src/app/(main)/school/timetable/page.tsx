'use client';

import { useTimetablePage } from '@/hooks/useTimetablePage';
import { SCHOOL_TIMETABLE_PAGE } from '@/constants';
import {
  Div, Button,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon, FilterLabel,
  ResponsiveSelect,
} from '@/components/ui';
import { Pencil, Eye, Trash2, Users, Calendar, Send, Undo2 } from 'lucide-react';

export default function TimetablePage() {
  const {
    years, timetables, classes, isLoading,
    filterAcademicYearId, setFilterAcademicYearId,
    filterClassId, setFilterClassId,
    removeTimetable, togglePublish, goToNew, goToView, goToEdit, goToEmployee, goToSession,
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
          <ResponsiveSelect
            value={filterAcademicYearId}
            onChange={(e) => setFilterAcademicYearId(e.target.value)}
            customPlaceholder="All Years"
            options={years.map((y) => ({ value: y.id, label: `${y.name}${y.is_current ? ' (Current)' : ''}` }))}
          />
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Class</FilterLabel>
          <ResponsiveSelect
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            customPlaceholder="All Classes"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Div>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.maxPeriods}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{SCHOOL_TIMETABLE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : timetables.length === 0 ? (
            <TableEmptyRow colSpan={5}>{SCHOOL_TIMETABLE_PAGE.empty}</TableEmptyRow>
          ) : (
            timetables.map((tt) => (
              <TableRow key={tt.id}>
                <TableCell primary>{tt.name}</TableCell>
                <TableCell>{tt.class_name ?? '—'}</TableCell>
                <TableCell>{tt.max_periods}</TableCell>
                <TableCell>
                  <Badge variant={tt.is_complete ? 'success' : 'default'}>
                    {tt.is_complete ? 'Published' : 'Draft'}
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePublish(tt)}
                      title={tt.is_complete ? 'Move back to draft' : 'Publish'}
                    >
                      <Icon icon={tt.is_complete ? Undo2 : Send} type="sm" />
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
