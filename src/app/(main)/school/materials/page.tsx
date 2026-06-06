"use client";

import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { MATERIALS_PAGE } from "@/constants";
import {
  Div, H1, P, Button, Select, Input,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Spinner, Modal, FormField, FilterLabel, FileInput, Icon,
} from "@/components/ui";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export default function StudyMaterialsPage() {
  const {
    years, selectedAcademicYearId, setSelectedAcademicYearId,
    classes, sections, subjects,
    selectedClassId, selectedSectionId, selectedSubjectId,
    setSelectedSubjectId,
    handleClassChange,
    handleSectionChange,
    materials,
    isLoading, isSaving, isUploading,
    showModal, setShowModal,
    editingId, form, fileRef,
    openAddModal, openEditModal,
    handleSubmit, handleDelete,
  } = useStudyMaterials();

  const { register, handleSubmit: onSubmit, formState: { errors } } = form;

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <H1>{MATERIALS_PAGE.title}</H1>
        <Button onClick={openAddModal} disabled={!selectedSectionId || !selectedSubjectId}>
          <Icon icon={Plus} type="btn-icon" />
          {MATERIALS_PAGE.addButton}
        </Button>
      </Div>

      {/* Filters */}
      <Div variant="card" padding="p-4">
        <Div type="grid" cols={4} gap="md">
          <Div type="col" gap="xs">
            <FilterLabel>Academic Year</FilterLabel>
            <Select value={selectedAcademicYearId} onChange={(e) => setSelectedAcademicYearId(e.target.value)}>
              <option value="">Select year</option>
              {years.map((y) => <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Class</FilterLabel>
            <Select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)} disabled={!selectedAcademicYearId}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Section</FilterLabel>
            <Select value={selectedSectionId} onChange={(e) => handleSectionChange(e.target.value)} disabled={!selectedClassId}>
              <option value="">Select section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Subject</FilterLabel>
            <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} disabled={!selectedSectionId}>
              <option value="">All subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Div>
        </Div>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{MATERIALS_PAGE.table.title}</TableHeaderCell>
            <TableHeaderCell>{MATERIALS_PAGE.table.subject}</TableHeaderCell>
            <TableHeaderCell>{MATERIALS_PAGE.table.fileType}</TableHeaderCell>
            <TableHeaderCell>{MATERIALS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : !selectedSectionId ? (
            <TableEmptyRow colSpan={5}>Select a section to view materials.</TableEmptyRow>
          ) : materials.length === 0 ? (
            <TableEmptyRow colSpan={5}>{MATERIALS_PAGE.empty}</TableEmptyRow>
          ) : (
            materials.map((mat, i) => {
              const sub = subjects.find((s) => s.id === mat.subject_id);
              return (
                <TableRow key={mat.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{mat.title}</TableCell>
                  <TableCell>{sub?.name ?? '—'}</TableCell>
                  <TableCell>{mat.file_type ?? '—'}</TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <a href={mat.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost">
                          <Icon icon={ExternalLink} type="sm" />
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(mat)}>
                        <Icon icon={Pencil} type="sm" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(mat.id)}>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editingId ? MATERIALS_PAGE.form.editTitle : MATERIALS_PAGE.form.title}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={onSubmit(handleSubmit)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label={MATERIALS_PAGE.form.matTitle} error={errors.title?.message}>
                <Input {...register("title")} placeholder="Chapter 5 Notes" />
              </FormField>
              <FormField label={MATERIALS_PAGE.form.description}>
                <Input {...register("description")} placeholder="Optional description" />
              </FormField>
              <FormField label={MATERIALS_PAGE.form.upload}>
                <Div type="col" gap="xs">
                  <FileInput ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" />
                  <P size="xs">Or enter URL directly:</P>
                  <Input {...register("file_url")} placeholder="https://..." />
                </Div>
              </FormField>
              <FormField label={MATERIALS_PAGE.form.fileType}>
                <Input {...register("file_type")} placeholder="PDF, Video, Slides…" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {MATERIALS_PAGE.form.cancel}
                </Button>
                <Button type="submit" loading={isSaving || isUploading}>
                  {MATERIALS_PAGE.form.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
