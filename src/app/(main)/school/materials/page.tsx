"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { MATERIALS_PAGE, ROUTES } from "@/constants";
import {
  Div, H1, Button, Select,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Spinner, FilterLabel, Icon, Modal,
} from "@/components/ui";
import { Plus, Pencil, Trash2, Eye, FileText, PlayCircle } from "lucide-react";
import type { StudyMaterial } from '@/types';

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default function StudyMaterialsPage() {
  const router = useRouter();
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null);

  const {
    years, selectedAcademicYearId, setSelectedAcademicYearId,
    classes, classDetails, subjects,
    selectedClassId, selectedClassDetailId, selectedSubjectId,
    setSelectedClassDetailId,
    setSelectedSubjectId,
    handleClassChange,
    materials,
    isLoading,
    handleDelete,
  } = useStudyMaterials();

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <H1>{MATERIALS_PAGE.title}</H1>
        <Button onClick={() => router.push(ROUTES.materialsNew)}>
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
            <FilterLabel>Year / Semester</FilterLabel>
            <Select value={selectedClassDetailId} onChange={(e) => setSelectedClassDetailId(e.target.value)} disabled={!selectedClassId}>
              <option value="">All</option>
              {classDetails.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Subject</FilterLabel>
            <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} disabled={!selectedClassId}>
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
          ) : !selectedClassId ? (
            <TableEmptyRow colSpan={5}>Select a class to view materials.</TableEmptyRow>
          ) : materials.length === 0 ? (
            <TableEmptyRow colSpan={5}>{MATERIALS_PAGE.empty}</TableEmptyRow>
          ) : (
            materials.map((mat, i) => {
              const sub = subjects.find((s) => s.id === mat.subject_id);
              const contentType = mat.content_type ?? 'file';
              return (
                <TableRow key={mat.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{mat.title}</TableCell>
                  <TableCell>{sub?.name ?? '—'}</TableCell>
                  <TableCell>
                    {contentType === 'text' && <Icon icon={FileText} type="sm" />}
                    {contentType === 'youtube' && <Icon icon={PlayCircle} type="sm" />}
                    {contentType === 'file' && (mat.file_type?.includes('pdf') ? 'PDF' : 'Image')}
                  </TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button size="sm" variant="ghost" onClick={() => setViewingMaterial(mat)}>
                        <Icon icon={Eye} type="sm" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => router.push(ROUTES.materialsEdit(mat.id))}>
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

      {/* View Modal */}
      {viewingMaterial && (
        <Modal
          title={viewingMaterial.title}
          size="lg"
          onClose={() => setViewingMaterial(null)}
        >
          <Div type="col" gap="md" padding="px-6 py-5">
            {viewingMaterial.content_type === 'text' && (
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                {viewingMaterial.content_text || '—'}
              </div>
            )}

            {viewingMaterial.content_type === 'file' && viewingMaterial.file_url && (
              viewingMaterial.file_type?.includes('pdf') || viewingMaterial.file_url.endsWith('.pdf') ? (
                <iframe
                  src={viewingMaterial.file_url}
                  className="w-full rounded"
                  style={{ height: '60vh' }}
                  title={viewingMaterial.title}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewingMaterial.file_url}
                  alt={viewingMaterial.title}
                  className="w-full rounded object-contain max-h-[60vh]"
                />
              )
            )}

            {viewingMaterial.content_type === 'youtube' && viewingMaterial.youtube_url && (
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={getYoutubeEmbedUrl(viewingMaterial.youtube_url)}
                  className="absolute inset-0 w-full h-full rounded"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={viewingMaterial.title}
                />
              </div>
            )}
          </Div>
        </Modal>
      )}
    </Div>
  );
}
