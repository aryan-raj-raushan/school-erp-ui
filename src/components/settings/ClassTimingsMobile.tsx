"use client";

import { EmptyState, MobileSelectField, Spinner } from "@/components/ui";
import { CLASS_TIMINGS_PAGE } from "@/constants/school-settings.constants";
import type { Class } from "@/types";
import type { SchoolTiming } from "@/types/school-settings.types";

const DEFAULT_TIMING = "";

export interface ClassTimingsMobileProps {
  classes: ReadonlyArray<Pick<Class, "id" | "name">>;
  timings: ReadonlyArray<Pick<SchoolTiming, "id" | "name">>;
  savingClassId: string | null;
  getOverrideForClass: (classId: string) => string | null | undefined;
  onChange: (classId: string, timingId: string | null) => void;
}

/** A selectable timing per class; the school default is the first option. */
export function ClassTimingsMobile({
  classes,
  timings,
  savingClassId,
  getOverrideForClass,
  onChange,
}: ClassTimingsMobileProps) {
  if (classes.length === 0) {
    return (
      <EmptyState
        title="No classes found"
        description="Create classes first to assign timing overrides"
      />
    );
  }

  const options = [
    { value: DEFAULT_TIMING, label: "School default" },
    ...timings.map((t) => ({ value: t.id, label: t.name })),
  ];

  return (
    <div className="flex flex-col gap-3 pt-3">
      <p className="px-1 text-sm text-muted-foreground">{CLASS_TIMINGS_PAGE.subtitle}</p>
      {classes.map((cls) => (
        <div key={cls.id} className="relative">
          <MobileSelectField
            label={cls.name}
            value={getOverrideForClass(cls.id) ?? DEFAULT_TIMING}
            onChange={(value) => onChange(cls.id, value || null)}
            options={options}
            disabled={savingClassId === cls.id}
          />
          {savingClassId === cls.id && (
            <span className="absolute right-12 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
