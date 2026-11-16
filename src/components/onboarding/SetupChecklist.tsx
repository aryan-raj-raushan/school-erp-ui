"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Circle } from "lucide-react";
import { DashCard } from "@/components/ui/dashboard";
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

  const nextKey = status.steps.find((step) => !step.done)?.key;
  const progress = Math.round((status.completed / status.total) * 100);

  return (
    <DashCard
      title="Finish setting up your school"
      description={`${status.completed} of ${status.total} steps done — complete these so staff, students and parents can start using the app.`}
      right={<span className="shrink-0 text-sm font-semibold text-primary">{progress}%</span>}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <ol className="flex flex-col divide-y divide-border">
        {status.steps.map((step, index) => {
          const copy = STEP_COPY[step.key];
          const isNext = step.key === nextKey;
          return (
            <li key={step.key}>
              <Link
                href={copy.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-muted/60",
                  isNext && "bg-primary/5",
                )}
              >
                {step.done ? (
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                ) : (
                  <Circle size={18} className={cn("shrink-0", isNext ? "text-primary" : "text-muted-foreground")} />
                )}
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm font-medium", step.done && "text-muted-foreground line-through")}>
                    {index + 1}. {copy.title}
                    {step.done && step.count ? ` (${step.count})` : ""}
                  </span>
                  {!step.done && <span className="block text-xs text-muted-foreground">{copy.hint}</span>}
                </span>
                {!step.done && <ChevronRight size={16} className="shrink-0 text-muted-foreground" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </DashCard>
  );
}
