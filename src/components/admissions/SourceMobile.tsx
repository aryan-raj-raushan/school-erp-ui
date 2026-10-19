"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import { Eye, Megaphone, Pencil, Trash2 } from "lucide-react";
import {
  ActionSheet,
  Badge,
  BottomSheet,
  Button,
  ControlledToggleRow,
  DetailField,
  DetailGrid,
  FieldRow,
  FormGroup,
  MobileListCard,
  MobileFormScreen,
  MobileListScreen,
  MobileTextField,
  type FilterField,
} from "@/components/ui";
import { useAdmissionSourcesInfinite } from "@/hooks/useAdmissionSourcesInfinite";
import { ADMISSION_ROUTES } from "@/constants/admission.constants";
import { formatDate } from "@/lib/utils";
import type { AdmissionSourceFormValues } from "@/lib/validations/admissions.validation";
import type { AdmissionSource } from "@/types/admissions.types";

function dateRange(source: AdmissionSource) {
  if (!source.start_date && !source.end_date) return "No date range";
  return `${formatDate(source.start_date) || "Any time"} → ${formatDate(source.end_date) || "Open"}`;
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return <Badge variant={enabled ? "success" : "default"}>{enabled ? "Enabled" : "Disabled"}</Badge>;
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────

interface SourceDetailSheetProps {
  source: AdmissionSource | null;
  onClose: () => void;
  onEdit: (source: AdmissionSource) => void;
}

/** Quick look at a source in a bottom sheet — the phone counterpart of the desktop detail page. */
export function SourceDetailSheet({ source, onClose, onEdit }: SourceDetailSheetProps) {
  return (
    <BottomSheet
      isOpen={source !== null}
      onClose={onClose}
      title={source?.name}
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-[2]"
            onClick={() => source && onEdit(source)}
          >
            <Pencil size={16} /> Edit
          </Button>
        </div>
      }
    >
      {source && (
        <div className="flex flex-col gap-4 pt-1">
          <StatusBadge enabled={source.is_enabled} />
          <DetailGrid>
            <DetailField label="Start date" value={formatDate(source.start_date)} />
            <DetailField label="End date" value={formatDate(source.end_date)} />
            <DetailField label="Created" value={formatDate(source.created_at)} />
            <DetailField
              label="Visibility"
              value={source.is_enabled ? "Shown for new enquiries" : "Hidden"}
            />
          </DetailGrid>
        </div>
      )}
    </BottomSheet>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────

const FILTER_FIELDS: FilterField[] = [
  {
    type: "select",
    key: "is_enabled",
    label: "Status",
    placeholder: "All Statuses",
    options: [
      { value: "true", label: "Enabled" },
      { value: "false", label: "Disabled" },
    ],
  },
];

export function SourceMobileList() {
  const router = useRouter();
  const [actionTarget, setActionTarget] = useState<AdmissionSource | null>(null);
  const [detailTarget, setDetailTarget] = useState<AdmissionSource | null>(null);

  const list = useAdmissionSourcesInfinite();
  const { filters, updateFilters } = list;

  const filterValues = useMemo<Record<string, string | undefined>>(
    () => ({
      is_enabled: filters.is_enabled === undefined ? undefined : String(filters.is_enabled),
    }),
    [filters.is_enabled],
  );

  return (
    <>
      <MobileListScreen
        filterFields={FILTER_FIELDS}
        filterValues={filterValues}
        onFilterChange={(next) => {
          if ("is_enabled" in next) {
            updateFilters({
              is_enabled: next.is_enabled === undefined ? undefined : next.is_enabled === "true",
            });
          }
        }}
        onFilterClear={() => updateFilters({ is_enabled: undefined })}
        filterSheetTitle="Filter sources"
        onRefresh={list.refresh}
        countLabel={`${list.total} ${list.total === 1 ? "source" : "sources"}`}
        isLoading={list.isLoading}
        isEmpty={list.items.length === 0}
        emptyIcon={<Megaphone size={28} />}
        emptyTitle="No sources yet"
        emptyDescription="Add where enquiries come from, like a website or newspaper ad."
        emptyFilteredTitle="No matching sources"
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        fab={{
          label: "Add source",
          onClick: () => router.push(ADMISSION_ROUTES.sourceCreateNew),
        }}
      >
        <ul className="flex flex-col gap-2.5">
          {list.items.map((source) => (
            <li key={source.id}>
              <MobileListCard
                leading={
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-text">
                    <Megaphone size={20} />
                  </span>
                }
                title={source.name}
                subtitle={dateRange(source)}
                badge={<StatusBadge enabled={source.is_enabled} />}
                muted={!source.is_enabled}
                onClick={() => setDetailTarget(source)}
                onMore={() => setActionTarget(source)}
                moreLabel={`Actions for ${source.name}`}
              />
            </li>
          ))}
        </ul>
      </MobileListScreen>

      <SourceDetailSheet
        source={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={(source) => router.push(ADMISSION_ROUTES.sourceEdit(source.id))}
      />

      <ActionSheet
        isOpen={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.name}
        actions={
          actionTarget
            ? [
                {
                  label: "View details",
                  icon: <Eye size={18} />,
                  onClick: () => setDetailTarget(actionTarget),
                },
                {
                  label: "Edit",
                  icon: <Pencil size={18} />,
                  onClick: () => router.push(ADMISSION_ROUTES.sourceEdit(actionTarget.id)),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  confirm: {
                    title: `Delete ${actionTarget.name}?`,
                    description: "Existing enquiries keep their history. This cannot be undone.",
                    confirmLabel: "Delete",
                  },
                  onClick: () => void list.deleteSource(actionTarget),
                },
              ]
            : []
        }
      />
    </>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface SourceMobileFormProps {
  form: UseFormReturn<AdmissionSourceFormValues>;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

/** Single-screen source form for create and edit on phones. */
export function SourceMobileForm({
  form,
  title,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: SourceMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  return (
    <MobileFormScreen
      title={title}
      submitLabel={submitLabel}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <FormGroup title="Source">
        <MobileTextField
          label="Name"
          required
          placeholder="e.g. School website, Newspaper ad"
          autoCapitalize="words"
          error={errors.name?.message}
          {...register("name")}
        />
      </FormGroup>

      <FormGroup title="Active period" description="Optional — leave blank for always.">
        <FieldRow>
          <MobileTextField
            label="Start"
            type="date"
            error={errors.start_date?.message}
            {...register("start_date")}
          />
          <MobileTextField
            label="End"
            type="date"
            error={errors.end_date?.message}
            {...register("end_date")}
          />
        </FieldRow>
      </FormGroup>

      <ControlledToggleRow
        control={control}
        name="is_enabled"
        label="Enabled"
        description="Visible when adding new enquiries"
      />
    </MobileFormScreen>
  );
}
