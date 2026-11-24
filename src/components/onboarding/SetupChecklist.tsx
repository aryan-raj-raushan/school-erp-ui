"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from "lucide-react";
import { ROUTES } from "@/constants";
import { usePermissions } from "@/hooks/usePermissions";
import { DashboardService, type SetupStatus, type SetupStepKey } from "@/services/dashboard.service";
import { cn } from "@/lib/utils";

const STEP_COPY: Record<SetupStepKey, { title: string; hint: string; href: string }> = {
  school_profile: {
    title: "Complete the school profile",
    hint: "Address, city and a contact number or email",
    href: ROUTES.schoolProfile,
  },
  academic_year: {
    title: "Create the academic year",
    hint: "Sessions drive admissions, fees and attendance",
    href: ROUTES.academicYears,
  },
  classes: {
    title: "Add classes",
    hint: "Nursery to 12th, or however your school is organised",
    href: ROUTES.classes,
  },
  sections: {
    title: "Add sections to classes",
    hint: "A, B, C… so students can be placed",
    href: ROUTES.classes,
  },
  timings: {
    title: "Set school timings",
    hint: "Start, end and late cut-offs used by attendance",
    href: ROUTES.timings,
  },
  staff: {
    title: "Add teachers and staff",
    hint: "Each one gets a login with a temporary password",
    href: ROUTES.staffs,
  },
  students: {
    title: "Add or import students",
    hint: "Use Import from Excel for the whole school at once",
    href: ROUTES.students,
  },
  parent_logins: {
    title: "Give parents app access",
    hint: "Issue parent logins so they can see attendance and fees",
    href: ROUTES.parents,
  },
};

export function SetupChecklist() {
  const { hasPermission } = usePermissions();
  const canSetUp = hasPermission("settings.update");
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!canSetUp) return;
    let active = true;
    DashboardService.getSetupStatus()
      .then((next) => {
        if (active) setStatus(next);
      })
      .catch(() => {
        if (active) setStatus(null);
      });
    return () => {
      active = false;
    };
  }, [canSetUp]);

  if (!canSetUp || !status || status.completed === status.total) return null;

  const nextStep = status.steps.find((step) => !step.done);
  const progress = Math.round((status.completed / status.total) * 100);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-card)] px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
          <p className="text-sm font-semibold">
            Finish setting up your school{" "}
            <span className="font-normal text-muted-foreground">
              · {status.completed} of {status.total} done
            </span>
          </p>
          <div className="mt-1.5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {nextStep && (
          <Link
            href={STEP_COPY[nextStep.key].href}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
          >
            Next: {STEP_COPY[nextStep.key].title}
            <ChevronRight size={14} />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-expanded={expanded}
        >
          {expanded ? "Hide steps" : "All steps"}
          <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded && (
        <ol className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
          {status.steps.map((step, index) => {
            const copy = STEP_COPY[step.key];
            return (
              <li key={step.key}>
                <Link
                  href={copy.href}
                  title={copy.hint}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-xs transition-colors hover:bg-muted/60",
                    step.key === nextStep?.key && "border-primary/40 bg-primary/5",
                  )}
                >
                  {step.done ? (
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-muted-foreground" />
                  )}
                  <span className={cn("min-w-0 truncate font-medium", step.done && "text-muted-foreground line-through")}>
                    {index + 1}. {copy.title}
                    {step.done && step.count ? ` (${step.count})` : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
