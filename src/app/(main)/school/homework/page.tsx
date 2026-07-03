'use client';

import { useHomework } from '@/hooks/useHomework';
import {
  HOMEWORK_PAGE,
  HOMEWORK_STATUS_BADGE,
  HOMEWORK_STATUS_OPTIONS,
  SUBMISSION_STATUS_OPTIONS,
} from '@/constants';
import {
  Div, Button, Select, Input,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Modal, FormField, FilterLabel, Icon, ResponsiveSelect, ResponsiveModalContainer,
} from '@/components/ui';
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-react';

export default function HomeworkPage() {
  const {
    years, classes, subjects,
    selectedAcademicYearId, setSelectedAcademicYearId,
    selectedClassId,
    selectedSubjectId, setSelectedSubjectId,
    handleClassChange,
    homeworkList,
    isLoading,
    handleDelete,
    goToNew,
    goToEdit,
    students, submissionMap,
    showSubmissionsModal, setShowSubmissionsModal,
    isSaving,
    openSubmissions,
    setSubmission,
    saveSubmissions,
  } = useHomework();

  return (
    <PageCol>
      <PageHeader
        title={HOMEWORK_PAGE.title}
        actions={
          <Button onClick={goToNew} disabled={!selectedClassId}>
            <Icon icon={Plus} type="btn-icon" />
            {HOMEWORK_PAGE.addButton}
          </Button>
        }
      />

      <Div variant="card" padding="p-4">
        <Div type="grid" cols={3} gap="md">
          <Div type="col" gap="xs">
            <FilterLabel>Academic Year</FilterLabel>
            <Select value={selectedAcademicYearId} onChange={(e) => setSelectedAcademicYearId(e.target.value)}>
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>
              ))}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Class</FilterLabel>
            <Select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)}>
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Subject</FilterLabel>
            <Select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Div>
        </Div>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.title}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.subject}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.homeworkDate}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.dueDate}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.createdBy}</TableHeaderCell>
            <TableHeaderCell>{HOMEWORK_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={8}><Spinner /></TableEmptyRow>
          ) : !selectedClassId ? (
            <TableEmptyRow colSpan={8}>{HOMEWORK_PAGE.empty}</TableEmptyRow>
          ) : homeworkList.length === 0 ? (
            <TableEmptyRow colSpan={8}>No homework assigned yet.</TableEmptyRow>
          ) : (
            homeworkList.map((hw, i) => (
              <TableRow key={hw.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{hw.title}</TableCell>
                <TableCell>{hw.subject_name ?? '—'}</TableCell>
                <TableCell>{hw.homework_date ?? '—'}</TableCell>
                <TableCell>{hw.due_date}</TableCell>
                <TableCell>
                  <Badge variant={HOMEWORK_STATUS_BADGE[hw.status]}>{hw.status}</Badge>
                </TableCell>
                <TableCell>{hw.created_by_name ?? '—'}</TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => openSubmissions(hw)}>
                      <Icon icon={ListChecks} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => goToEdit(hw)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(hw.id)}>
                      <Icon icon={Trash2} type="sm-danger" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showSubmissionsModal && (
        <ResponsiveModalContainer
          isOpen={showSubmissionsModal}
          title={HOMEWORK_PAGE.submissions.title}
          onClose={() => setShowSubmissionsModal(false)}
        >
          <div className="px-4 py-4">
            <Div type="col" gap="md">
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>{HOMEWORK_PAGE.submissions.table.student}</TableHeaderCell>
                    <TableHeaderCell>{HOMEWORK_PAGE.submissions.table.status}</TableHeaderCell>
                    <TableHeaderCell>{HOMEWORK_PAGE.submissions.table.remarks}</TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableEmptyRow colSpan={3}>{HOMEWORK_PAGE.submissions.empty}</TableEmptyRow>
                  ) : (
                    students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell primary>{s.first_name} {s.last_name ?? ''}</TableCell>
                        <TableCell>
                          <ResponsiveSelect
                            value={submissionMap[s.id]?.status ?? 'PENDING'}
                            onChange={(e) => setSubmission(s.id, 'status', e.target.value)}
                            options={SUBMISSION_STATUS_OPTIONS}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Remarks"
                            value={submissionMap[s.id]?.remarks ?? ''}
                            onChange={(e) => setSubmission(s.id, 'remarks', e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Div type="row" justify="end" gap="sm">
                <Button variant="outline" onClick={() => setShowSubmissionsModal(false)}>Cancel</Button>
                <Button loading={isSaving} onClick={saveSubmissions}>
                  {HOMEWORK_PAGE.submissions.save}
                </Button>
              </Div>
            </Div>
          </div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
