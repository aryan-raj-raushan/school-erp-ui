"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, FileText, PlayCircle } from "lucide-react";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { MATERIALS_PAGE, ROUTES } from "@/constants";
import type { StudyMaterial } from '@/types';
import {
  Div,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  DataTable,
  type ColumnDef,
  FilterToolbar,
  type FilterField,
  RowActions,
  Icon,
  ResponsiveModalContainer,
} from "@/components/ui";

type PersistedMaterialFilters = {
  academic_year_id?: string;
  class_id?: string;
  subject_id?: string;
};

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default function StudyMaterialsPage() {
  const router = useRouter();
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null);

  const {
    years, selectedAcademicYearId, setSelectedAcademicYearId,
    classes, subjects,
    selectedClassId, selectedSubjectId,
    setSelectedSubjectId,
    handleClassChange,
    materials,
    isLoading,
    handleDelete,
  } = useStudyMaterials();

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedMaterialFilters>({
    key: STORAGE_FILTER_KEYS.STUDY_MATERIALS,
    defaultValue: {},
  });

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("academic_year_id" in next) setSelectedAcademicYearId(next.academic_year_id ?? "");
    if ("class_id" in next) handleClassChange(next.class_id ?? "");
    if ("subject_id" in next) setSelectedSubjectId(next.subject_id ?? "");

    const persisted: Partial<PersistedMaterialFilters> = {};
    (["academic_year_id", "class_id", "subject_id"] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field];
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    handleFilterChange({
      academic_year_id: undefined,
      class_id: undefined,
      subject_id: undefined,
    });
    clearStoredFilters();
  }

  // One-time: once storage has hydrated, apply any filters saved from a
  // previous visit.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      if (storedFilters.academic_year_id) setSelectedAcademicYearId(storedFilters.academic_year_id);
      if (storedFilters.class_id) handleClassChange(storedFilters.class_id);
      if (storedFilters.subject_id) setSelectedSubjectId(storedFilters.subject_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: "Select year",
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: "Select class",
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        disabled: !selectedAcademicYearId,
        resetKeys: ["subject_id"],
      },
      {
        type: "select",
        key: "subject_id",
        label: "Subject",
        placeholder: "All subjects",
        options: subjects.map((s) => ({ value: s.id, label: s.name })),
        disabled: !selectedClassId,
      },
    ],
    [years, classes, subjects, selectedAcademicYearId, selectedClassId],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: selectedAcademicYearId || undefined,
    class_id: selectedClassId || undefined,
    subject_id: selectedSubjectId || undefined,
  };

  const columns = useMemo<ColumnDef<StudyMaterial>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "title",
        header: MATERIALS_PAGE.table.title,
        meta: { primary: true },
      },
      {
        id: "subject",
        header: MATERIALS_PAGE.table.subject,
        cell: ({ row }) =>
          subjects.find((s) => s.id === row.original.subject_id)?.name ?? "—",
      },
      {
        id: "fileType",
        header: MATERIALS_PAGE.table.fileType,
        cell: ({ row }) => {
          const contentType = row.original.content_type ?? "file";
          if (contentType === "text") return <Icon icon={FileText} type="sm" />;
          if (contentType === "youtube") return <Icon icon={PlayCircle} type="sm" />;
          return row.original.file_type?.includes("pdf") ? "PDF" : "Image";
        },
      },
      {
        id: "actions",
        header: MATERIALS_PAGE.table.actions,
        cell: ({ row }) => (
          <RowActions
            onView={() => setViewingMaterial(row.original)}
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () => router.push(ROUTES.materialsEdit(row.original.id)),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete "${row.original.title}"? This action cannot be undone.`,
                },
                onClick: () => handleDelete(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [subjects, router, handleDelete],
  );

  const pageHeaderConfig: PageHeaderConfig = {
    title: MATERIALS_PAGE.title,
    actions: [
      {
        label: MATERIALS_PAGE.addButton,
        icon: <Plus size={14} />,
        onClick: () => router.push(ROUTES.materialsNew),
      },
    ],
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        sheetTitle="Filter Materials"
      />

      <DataTable
        columns={columns}
        data={materials}
        isLoading={isLoading}
        emptyText={!selectedClassId ? "Select a class to view materials." : MATERIALS_PAGE.empty}
        fillViewport
      />

      {/* View Modal */}
      {viewingMaterial && (
        <ResponsiveModalContainer
          isOpen={!!viewingMaterial}
          title={viewingMaterial.title}
          onClose={() => setViewingMaterial(null)}
        >
          <div className="px-4 py-4">
            <Div type="col" gap="md">
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
          </div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
