'use client';

import { useSyllabusPage } from '@/hooks/useSyllabusPage';
import { SYLLABUS_PAGE } from '@/constants';
import {
  Div, Button,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon, Select, FilterLabel,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

export default function SyllabusPage() {
  const {
    syllabi, classes, classDetails, isLoading,
    filterClassId, setFilterClassId,
    filterClassDetailId, setFilterClassDetailId,
    removeSyllabus, navigateToNew, navigateToEdit,
    getClassName,
  } = useSyllabusPage();

  return (
    <PageCol>
      <PageHeader
        title={SYLLABUS_PAGE.title}
        actions={<Button onClick={navigateToNew}>{SYLLABUS_PAGE.addButton}</Button>}
      />

      <Div type="row" gap="md" align="end" wrap>
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
            <TableHeaderCell>{SYLLABUS_PAGE.table.title}</TableHeaderCell>
            <TableHeaderCell>{SYLLABUS_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{SYLLABUS_PAGE.table.enabled}</TableHeaderCell>
            <TableHeaderCell>{SYLLABUS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={4}><Spinner /></TableEmptyRow>
          ) : syllabi.length === 0 ? (
            <TableEmptyRow colSpan={4}>{SYLLABUS_PAGE.empty}</TableEmptyRow>
          ) : (
            syllabi.map((s) => (
              <TableRow key={s.id}>
                <TableCell primary>{s.title}</TableCell>
                <TableCell>{getClassName(s.class_id)}</TableCell>
                <TableCell>
                  <Badge variant={s.is_enabled ? 'success' : 'default'}>
                    {s.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => navigateToEdit(s.id)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeSyllabus(s.id)}>
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
