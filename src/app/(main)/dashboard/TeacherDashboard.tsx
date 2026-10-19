"use client";

import { BookOpen, CalendarDays, GraduationCap } from "lucide-react";
import { useTeacherDashboardPage } from "@/hooks/useTeacherDashboardPage";
import {
  DashSection,
  DashboardColumns,
  DashboardError,
  DashboardHero,
  DashboardRoot,
  DashboardSkeleton,
  KpiGrid,
  KpiTile,
  ListCard,
  QuickActions,
} from "@/components/ui/dashboard";

export function TeacherDashboard() {
  const vm = useTeacherDashboardPage();

  return (
    <DashboardRoot onRefresh={vm.refresh}>
      <DashboardHero
        eyebrow={vm.eyebrow}
        greeting={vm.greeting}
        title={vm.title}
        chips={vm.chips}
        stat={vm.isLoading ? null : vm.heroStat}
      />

      {vm.error && <DashboardError message="Couldn't load your dashboard. Please try again." />}

      {vm.isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashSection title="Quick actions">
            <QuickActions actions={vm.actions} />
          </DashSection>

          <DashSection title="Today">
            <KpiGrid>
              {vm.kpis.map((kpi) => (
                <KpiTile key={kpi.key} kpi={kpi} />
              ))}
            </KpiGrid>
          </DashSection>

          <DashSection title="Coming up">
            <DashboardColumns>
              <ListCard title="My recent homework" icon={BookOpen} accent="blue" items={vm.homework} emptyText="You haven't assigned homework yet" />
              <ListCard title="Upcoming exams" icon={GraduationCap} accent="amber" items={vm.exams} emptyText="No upcoming exams" />
            </DashboardColumns>
            <ListCard title="Events & holidays" icon={CalendarDays} accent="pink" items={vm.events} emptyText="Nothing scheduled" />
          </DashSection>
        </>
      )}
    </DashboardRoot>
  );
}
