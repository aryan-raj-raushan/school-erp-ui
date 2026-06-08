'use client';

import { useClasses } from '@/hooks/useClasses';
import { useClassDetails } from '@/hooks/useClassDetails';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useClassesPageTabs, CLASSES_TAB_OPTIONS } from '@/hooks/useClassesPageTabs';
import { CLASSES_PAGE, CLASS_DETAILS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, P, Button, Tabs,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Trash2, Pencil } from 'lucide-react';

export default function ClassesPage() {
  const { activeTab, setActiveTab } = useClassesPageTabs();
  const { years } = useAcademicYears();
  const {
    classes, isLoading,
    sectionsForClass, removeClass,
    navigateToNew, navigateToEdit,
  } = useClasses();
  const { classDetails, isLoading: isLoadingDetails, removeClassDetail, navigateToNew: navigateToNewDetail, navigateToEdit: navigateToEditDetail } = useClassDetails();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={CLASSES_PAGE.title}
        illustration="/illustrations/graduation.svg"
        actions={
          activeTab === 'classes'
            ? <Button onClick={navigateToNew}>{CLASSES_PAGE.addClassButton}</Button>
            : <Button onClick={navigateToNewDetail}>{CLASS_DETAILS_PAGE.addButton}</Button>
        }
      />

      <Tabs
        options={CLASSES_TAB_OPTIONS}
        value={activeTab}
        onChange={setActiveTab}
        className="max-w-xs"
      />

      {activeTab === 'classes' && (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>{CLASSES_PAGE.classTable.name}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.academicYear}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.department}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.classType}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.sections}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.actions}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
            ) : classes.length === 0 ? (
              <TableEmptyRow colSpan={6}>{CLASSES_PAGE.classEmpty}</TableEmptyRow>
            ) : (
              classes.map((cls) => {
                const clsSections = sectionsForClass(cls.id);
                const year = years.find((y) => y.id === cls.academic_year_id);
                return (
                  <TableRow key={cls.id}>
                    <TableCell primary>{cls.name}</TableCell>
                    <TableCell>{year?.name ?? '—'}</TableCell>
                    <TableCell>{cls.department ?? '—'}</TableCell>
                    <TableCell>{cls.class_type ?? '—'}</TableCell>
                    <TableCell>
                      <Div type="row" gap="xs" wrap>
                        {clsSections.length === 0 ? (
                          <P size="xs">—</P>
                        ) : (
                          clsSections.map((s) => (
                            <Badge key={s.id} variant="info">{cls.name} — {s.name}</Badge>
                          ))
                        )}
                      </Div>
                    </TableCell>
                    <TableCell>
                      <Div type="row" gap="xs">
                        <Button size="sm" variant="ghost" onClick={() => navigateToEdit(cls.id)}>
                          <Icon icon={Pencil} type="sm" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeClass(cls.id)}>
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
      )}

      {activeTab === 'class-details' && (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>{CLASS_DETAILS_PAGE.table.class}</TableHeaderCell>
              <TableHeaderCell>{CLASS_DETAILS_PAGE.table.name}</TableHeaderCell>
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
            {isLoadingDetails ? (
              <TableEmptyRow colSpan={10}><Spinner /></TableEmptyRow>
            ) : classDetails.length === 0 ? (
              <TableEmptyRow colSpan={10}>{CLASS_DETAILS_PAGE.empty}</TableEmptyRow>
            ) : (
              classDetails.map((detail) => {
                const cls = classes.find((c) => c.id === detail.class_id);
                return (
                  <TableRow key={detail.id}>
                    <TableCell primary>{cls?.name ?? '—'}</TableCell>
                    <TableCell>{detail.name}</TableCell>
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
                        <Button size="sm" variant="ghost" onClick={() => navigateToEditDetail(detail.id)}>
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
      )}
    </Div>
  );
}
