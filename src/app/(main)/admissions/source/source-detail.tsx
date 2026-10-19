"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil, X } from "lucide-react";
import { useAdmissionSourceDetail } from "@/hooks/useAdmissions";
import { useIsMobileReady } from "@/hooks/useIsMobileReady";
import { ADMISSION_ROUTES } from "@/constants/admission.constants";
import { SourceMobileForm } from "@/components/admissions/SourceMobile";
import { formatDate } from "@/lib/utils";
import {
  Badge,
  Button,
  DetailField,
  DetailGrid,
  DetailSection,
  Div,
  FormField,
  H1,
  H2,
  H3,
  InfoRow,
  Input,
  PullToRefresh,
  Spinner,
  StickyActionBar,
} from "@/components/ui";

const LONG_DATE: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

function longDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-IN", LONG_DATE) : "—";
}

export function AdmissionSourceDetail({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startEditing = searchParams.get("edit") === "true";
  const viewportIsMobile = useIsMobileReady();

  const {
    source,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    handleSubmit,
    isSubmitting,
    refetch,
  } = useAdmissionSourceDetail(id);

  useEffect(() => {
    if (startEditing) setIsEditing(true);
  }, [startEditing, setIsEditing]);

  const {
    register,
    formState: { errors },
    reset,
  } = form;

  function cancelEditing() {
    setIsEditing(false);
    reset();
  }

  if (isLoading || viewportIsMobile === undefined) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  if (viewportIsMobile) {
    if (isEditing) {
      return (
        <SourceMobileForm
          form={form}
          title="Edit source"
          submitLabel="Save changes"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={startEditing ? () => router.back() : cancelEditing}
        />
      );
    }

    return (
      <PullToRefresh onRefresh={refetch}>
        <Div className="flex flex-col gap-3 pt-3">
          {source && (
            <>
              <DetailSection title={source.name} collapsible={false}>
                <Div className="flex flex-col gap-4">
                  <Badge variant={source.is_enabled ? "success" : "default"}>
                    {source.is_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <DetailGrid>
                    <DetailField label="Start date" value={formatDate(source.start_date)} />
                    <DetailField label="End date" value={formatDate(source.end_date)} />
                    <DetailField label="Created" value={formatDate(source.created_at)} />
                  </DetailGrid>
                </Div>
              </DetailSection>
              <StickyActionBar>
                <Button type="button" size="lg" className="flex-1" onClick={() => setIsEditing(true)}>
                  <Pencil size={16} /> Edit source
                </Button>
              </StickyActionBar>
            </>
          )}
        </Div>
      </PullToRefresh>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.push(ADMISSION_ROUTES.sources)}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <Div type="row" align="center" gap="sm">
            <H1>{source?.name ?? "Source Details"}</H1>
            {source && (
              <Badge variant={source.is_enabled ? "success" : "default"}>
                {source.is_enabled ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </Div>
        </Div>
        {isEditing ? (
          <Button variant="outline" size="sm" onClick={cancelEditing}>
            <X size={14} /> Cancel
          </Button>
        ) : (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Pencil size={14} /> Edit
          </Button>
        )}
      </Div>

      {!isEditing && source && (
        <Div
          type="col"
          gap="sm"
          className="rounded-xl border border-border bg-card p-5"
        >
          <H3
            color="muted"
            className="uppercase tracking-wider text-xs font-semibold mb-2"
          >
            Details
          </H3>
          <InfoRow label="Name" value={source.name} />
          <InfoRow
            label="Status"
            value={source.is_enabled ? "Enabled" : "Disabled"}
          />
          <InfoRow label="Start Date" value={longDate(source.start_date)} />
          <InfoRow label="End Date" value={longDate(source.end_date)} />
          <InfoRow label="Created" value={longDate(source.created_at)} />
        </Div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit}>
          <Div type="col" gap="lg">
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Source Details
              </H2>
              <FormField label="Name *" error={errors.name?.message}>
                <Input
                  placeholder="e.g. School Website, Word of Mouth, Newspaper Ad"
                  {...register("name")}
                />
              </FormField>
              <Div type="grid" cols={2} gap="md">
                <FormField label="Start Date" error={errors.start_date?.message}>
                  <Input type="date" {...register("start_date")} />
                </FormField>
                <FormField label="End Date" error={errors.end_date?.message}>
                  <Input type="date" {...register("end_date")} />
                </FormField>
              </Div>
              <Div type="row" align="center" gap="sm">
                <input type="checkbox" id="is_enabled" {...register("is_enabled")} />
                <label
                  htmlFor="is_enabled"
                  className="text-sm font-medium text-foreground/80 cursor-pointer"
                >
                  Source is enabled (visible for new enquiries)
                </label>
              </Div>
            </Div>

            <Div type="row" justify="end" gap="sm">
              <Button variant="outline" type="button" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save Changes
              </Button>
            </Div>
          </Div>
        </form>
      )}
    </Div>
  );
}
