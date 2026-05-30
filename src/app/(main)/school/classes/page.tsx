'use client';

import { useState } from 'react';
import { useClasses } from '@/hooks/useClasses';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { CLASSES_PAGE, CLASSES_VIEW_TABS, type ClassesViewTab } from '@/constants';
import {
  Div, H1, P, Button, Tabs,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Modal, ModalBody, ModalFooter, FormField, Input, Select,
  Badge, Spinner,
} from '@/components/ui';

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState<ClassesViewTab>('classes');
  const { years, currentYear } = useAcademicYears();
  const {
    classes, sections, isLoading,
    showClassModal, showSectionModal,
    openClassModal, closeClassModal,
    openSectionModal, closeSectionModal,
    classForm, sectionForm,
    handleClassSubmit, handleSectionSubmit,
    isClassSubmitting, isSectionSubmitting,
    removeClass, removeSection,
  } = useClasses();

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>{CLASSES_PAGE.title}</H1>
          <P>{currentYear ? `Academic Year: ${currentYear.name}` : 'No current academic year set'}</P>
        </Div>
        <Div type="row" gap="sm">
          <Button variant="outline" onClick={openSectionModal}>{CLASSES_PAGE.addSectionButton}</Button>
          <Button onClick={openClassModal}>{CLASSES_PAGE.addClassButton}</Button>
        </Div>
      </Div>

      <Tabs options={CLASSES_VIEW_TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === 'classes' ? (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>{CLASSES_PAGE.classTable.name}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.academicYear}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.order}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.sections}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.classTable.actions}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
            ) : classes.length === 0 ? (
              <TableEmptyRow colSpan={5}>{CLASSES_PAGE.classEmpty}</TableEmptyRow>
            ) : (
              classes.map((cls) => {
                const clsSections = sections.filter((s) => s.class_id === cls.id);
                const year = years.find((y) => y.id === cls.academic_year_id);
                return (
                  <TableRow key={cls.id}>
                    <TableCell primary>{cls.name}</TableCell>
                    <TableCell>{year?.name ?? '—'}</TableCell>
                    <TableCell>{cls.numeric_value ?? '—'}</TableCell>
                    <TableCell>
                      <Div type="row" gap="xs" wrap>
                        {clsSections.map((s) => (
                          <Badge key={s.id} variant="info">{s.name}</Badge>
                        ))}
                        {clsSections.length === 0 && <P color="muted">—</P>}
                      </Div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => removeClass(cls.id)}>
                        {CLASSES_PAGE.deleteButton}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>{CLASSES_PAGE.sectionTable.section}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.sectionTable.class}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.sectionTable.room}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.sectionTable.maxStrength}</TableHeaderCell>
              <TableHeaderCell>{CLASSES_PAGE.sectionTable.actions}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
            ) : sections.length === 0 ? (
              <TableEmptyRow colSpan={5}>{CLASSES_PAGE.sectionEmpty}</TableEmptyRow>
            ) : (
              sections.map((sec) => {
                const cls = classes.find((c) => c.id === sec.class_id);
                return (
                  <TableRow key={sec.id}>
                    <TableCell primary>{sec.name}</TableCell>
                    <TableCell>{cls?.name ?? '—'}</TableCell>
                    <TableCell>{sec.room_number ?? '—'}</TableCell>
                    <TableCell>{sec.max_strength ?? '—'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => removeSection(sec.id)}>
                        {CLASSES_PAGE.deleteButton}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {showClassModal && (
        <Modal onClose={closeClassModal} title={CLASSES_PAGE.classForm.title} size="md">
          <form onSubmit={handleClassSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label={CLASSES_PAGE.classForm.name} error={classForm.formState.errors.name?.message}>
                  <Input placeholder={CLASSES_PAGE.placeholders.className} {...classForm.register('name')} />
                </FormField>
                <FormField label={CLASSES_PAGE.classForm.academicYear} error={classForm.formState.errors.academic_year_id?.message}>
                  <Select {...classForm.register('academic_year_id')}>
                    <option value="">Select academic year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </Select>
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={CLASSES_PAGE.classForm.order} error={classForm.formState.errors.numeric_value?.message}>
                    <Input type="number" placeholder={CLASSES_PAGE.placeholders.classOrder} {...classForm.register('numeric_value')} />
                  </FormField>
                  <FormField label={CLASSES_PAGE.classForm.description} error={classForm.formState.errors.description?.message}>
                    <Input placeholder={CLASSES_PAGE.placeholders.description} {...classForm.register('description')} />
                  </FormField>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeClassModal}>{CLASSES_PAGE.classForm.cancel}</Button>
              <Button type="submit" loading={isClassSubmitting}>{CLASSES_PAGE.classForm.submit}</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {showSectionModal && (
        <Modal onClose={closeSectionModal} title={CLASSES_PAGE.sectionForm.title} size="md">
          <form onSubmit={handleSectionSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label={CLASSES_PAGE.sectionForm.name} error={sectionForm.formState.errors.name?.message}>
                  <Input placeholder={CLASSES_PAGE.placeholders.sectionName} {...sectionForm.register('name')} />
                </FormField>
                <FormField label={CLASSES_PAGE.sectionForm.class} error={sectionForm.formState.errors.class_id?.message}>
                  <Select {...sectionForm.register('class_id')}>
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={CLASSES_PAGE.sectionForm.room} error={sectionForm.formState.errors.room_number?.message}>
                    <Input placeholder={CLASSES_PAGE.placeholders.room} {...sectionForm.register('room_number')} />
                  </FormField>
                  <FormField label={CLASSES_PAGE.sectionForm.maxStrength} error={sectionForm.formState.errors.max_strength?.message}>
                    <Input type="number" placeholder={CLASSES_PAGE.placeholders.maxStrength} {...sectionForm.register('max_strength')} />
                  </FormField>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeSectionModal}>{CLASSES_PAGE.sectionForm.cancel}</Button>
              <Button type="submit" loading={isSectionSubmitting}>{CLASSES_PAGE.sectionForm.submit}</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
