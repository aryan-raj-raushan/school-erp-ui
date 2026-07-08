'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTimetablePage } from '@/hooks/useTimetablePage';
import { useViewTimetable } from '@/hooks/useViewTimetable';
import { SCHOOL_TIMETABLE_PAGE, DAYS_OF_WEEK, DAY_LABELS } from '@/constants';
import {
  Div, Button,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon, FilterLabel,
  ResponsiveSelect,
} from '@/components/ui';
import { Pencil, Eye, Trash2, Users, Calendar, Send, Undo2, Printer } from 'lucide-react';

function ViewTimetableContent({ id }: { id: string }) {
  const {
    timetable, isLoading, periods, days,
    getCell, getPeriodTime,
    handlePrint, goToEdit, handleBack, togglePublish,
  } = useViewTimetable(id);

  if (isLoading) {
    return <Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>;
  }

  if (!timetable) return null;

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={timetable.name}
        subtitle={timetable.class_name ?? undefined}
        actions={
          <Div type="row" gap="sm">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button onClick={goToEdit}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant={timetable.is_complete ? 'outline' : 'success'} onClick={togglePublish}>
              {timetable.is_complete ? (
                <>
                  <Undo2 className="w-4 h-4 mr-1" />
                  Move to Draft
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Publish
                </>
              )}
            </Button>
          </Div>
        }
      />

      <Div type="row" gap="md" align="center">
        <Badge variant={timetable.is_complete ? 'success' : 'default'}>
          {timetable.is_complete ? 'Published' : 'Draft'}
        </Badge>
        <span className="text-sm text-muted-foreground">{timetable.max_periods} periods</span>
        {timetable.class_teacher_name && (
          <span className="text-sm text-muted-foreground">Class Teacher: {timetable.class_teacher_name}</span>
        )}
      </Div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="min-w-full text-sm border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-3 py-2 text-left font-medium w-20">Day</th>
              {periods.map((p) => {
                const pt = getPeriodTime(p);
                return (
                  <th key={p} className="border border-border px-2 py-2 text-center font-medium min-w-[120px]">
                    <div>{pt?.is_break ? <Badge variant="warning">Break</Badge> : `P${p}`}</div>
                    {pt?.start_time && (
                      <div className="text-xs text-muted-foreground font-normal">
                        {pt.start_time}{pt.end_time ? `–${pt.end_time}` : ''}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="border border-border px-3 py-2 font-medium bg-muted/30">{DAY_LABELS[day]}</td>
                {periods.map((p) => {
                  const isBreak = getPeriodTime(p)?.is_break ?? false;
                  const cell = getCell(day, p);
                  return (
                    <td key={p} className={`border border-border px-2 py-2 text-center align-top ${isBreak ? 'bg-muted/30' : ''}`}>
                      {isBreak ? (
                        <span className="text-muted-foreground text-xs">Break</span>
                      ) : cell ? (
                        <Div type="col" gap="xs" align="center">
                          {cell.subject_name && (
                            <span className="font-medium text-sm">{cell.subject_name}</span>
                          )}
                          {cell.teacher_name && (
                            <span className="text-xs text-muted-foreground">{cell.teacher_name}</span>
                          )}
                        </Div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={periods.length + 1} className="border border-border px-3 py-2 bg-muted/30">
                <span className="text-sm font-medium">Class Teacher: </span>
                <span className="text-sm">{timetable.class_teacher_name ?? '—'}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Div>
  );
}

function TimetablePageContent() {
  const searchParams = useSearchParams();
  const detailId = searchParams.get('id');
  const {
    years, timetables, classes, isLoading,
    filterAcademicYearId, setFilterAcademicYearId,
    filterClassId, setFilterClassId,
    removeTimetable, togglePublish, goToNew, goToView, goToEdit, goToEmployee, goToSession,
  } = useTimetablePage();

  if (detailId) {
    return <ViewTimetableContent id={detailId} />;
  }

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

export default function TimetablePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <TimetablePageContent />
    </Suspense>
  );
}
