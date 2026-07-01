'use client';

import { use, Suspense } from 'react';

import { useViewTimetable } from '@/hooks/useViewTimetable';
import { SCHOOL_TIMETABLE_PAGE, DAYS_OF_WEEK, DAY_LABELS } from '@/constants';
import { Div, Button, Spinner, Badge, PageHeader, PageCol } from '@/components/ui';
import { Pencil, Printer, Send, Undo2 } from 'lucide-react';

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

export default function ViewTimetablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <ViewTimetableContent id={id} />
    </Suspense>
  );
}
