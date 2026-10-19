"use client";

import {
  Div,
  H1,
  H2,
  P,
  Badge,
  Spinner,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
} from "@/components/ui";
import { useIsMobileSync } from "@/hooks/useIsMobileSync";
import { useParentProfile } from "@/hooks/useParentProfile";
import { useParentChildren } from "@/hooks/useParentChildren";

function fieldLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const STUDENT_FIELDS = [
  "admission_number",
  "roll_number",
  "class_name",
  "section_name",
  "gender",
  "blood_group",
  "phone_number",
];

export default function ParentProfilePage() {
  const isMobile = useIsMobileSync();
  const { activeChild } = useParentChildren();
  const { profile, isLoading, error } = useParentProfile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <DetailHero
          name={activeChild?.student_name ?? "Student"}
          subtitle={activeChild?.class_label ?? undefined}
          badge={
            activeChild?.student_status ? (
              <Badge variant="secondary">{activeChild.student_status}</Badge>
            ) : undefined
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <Badge variant="danger">{error}</Badge>
        ) : profile ? (
          <>
            <DetailSection title="Student details">
              <DetailGrid>
                {STUDENT_FIELDS.filter((key) => profile.student?.[key] != null).map((key) => (
                  <DetailField key={key} label={fieldLabel(key)} value={String(profile.student[key])} />
                ))}
              </DetailGrid>
            </DetailSection>

            {profile.guardians?.length > 0 && (
              <DetailSection title="Guardians">
                <ul className="flex flex-col gap-3">
                  {profile.guardians.map((g, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium">
                          {String(g.first_name ?? "")} {String(g.last_name ?? "")}
                        </span>
                        <span className="block text-xs text-muted-foreground">{String(g.relation ?? "")}</span>
                      </span>
                      {typeof g.phone_number === "string" && g.phone_number && (
                        <a
                          href={`tel:${typeof g.dial_code === "string" ? g.dial_code : ""}${g.phone_number}`}
                          className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-text active:opacity-70"
                        >
                          Call
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Profile</H1>

      <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4">
        <P className="font-semibold">{activeChild?.student_name}</P>
        {activeChild?.class_label && <P color="muted" className="text-sm">{activeChild.class_label}</P>}
        {activeChild?.student_status && <Badge variant="secondary" className="w-fit">{activeChild.student_status}</Badge>}
      </Div>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : profile ? (
        <>
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
            <H2 className="text-sm font-semibold">Student Details</H2>
            <Div type="grid" gap="sm" className="grid-cols-2">
              {STUDENT_FIELDS.filter((key) => profile.student?.[key] != null).map((key) => (
                <Div key={key} type="col" gap="xs">
                  <P color="muted" className="text-xs">{fieldLabel(key)}</P>
                  <P className="text-sm">{String(profile.student[key])}</P>
                </Div>
              ))}
            </Div>
          </Div>

          {profile.guardians?.length > 0 && (
            <Div type="col" gap="sm">
              <H2 className="text-sm font-semibold">Guardians</H2>
              {profile.guardians.map((g, i) => (
                <Div key={i} type="row" justify="between" align="center" className="rounded-lg border border-border bg-card px-4 py-3">
                  <P className="text-sm font-medium">{String(g.first_name ?? "")} {String(g.last_name ?? "")}</P>
                  <P color="muted" className="text-xs">{String(g.relation ?? "")}</P>
                </Div>
              ))}
            </Div>
          )}
        </>
      ) : null}
    </Div>
  );
}
