"use client";

import { BookOpen, CalendarDays, GraduationCap } from "lucide-react";
import { useParentPortalPage } from "@/hooks/useParentPortalPage";
import {
  AlertList,
  DashSection,
  DashboardError,
  DashboardHero,
  DashboardRoot,
  DashboardSkeleton,
  KpiGrid,
  KpiTile,
  ListCard,
} from "@/components/ui/dashboard";
import { SupportContactPanel } from "@/components/layout/SupportContact";

export default function ParentPortalPage() {
  const vm = useParentPortalPage();

  return (
    <div className="px-4 md:px-6">
      <DashboardRoot>
        <DashboardHero
          compact
          eyebrow={vm.eyebrow}
          greeting={vm.greetingName}
          title={vm.title}
          chips={vm.chips}
          stat={vm.isLoading ? null : vm.heroStat}
        />

        <SupportContactPanel />

        {vm.error && <DashboardError message="Couldn't load the dashboard. Please try again." />}

        {vm.isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <AlertList alerts={vm.alerts} />

            <DashSection title="Overview">
              <KpiGrid>
                {vm.kpis.map((kpi) => (
                  <KpiTile key={kpi.key} kpi={kpi} />
                ))}
              </KpiGrid>
            </DashSection>

            <DashSection title="Coming up">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ListCard title="Recent homework" icon={BookOpen} accent="blue" items={vm.homework} emptyText="No homework assigned recently" />
                <ListCard title="Upcoming exams" icon={GraduationCap} accent="amber" items={vm.exams} emptyText="No exams scheduled" />
                <ListCard title="Events & holidays" icon={CalendarDays} accent="pink" items={vm.events} emptyText="Nothing coming up" />
              </div>
            </DashSection>
          </>
        )}
      </DashboardRoot>
    </div>
  );
}
