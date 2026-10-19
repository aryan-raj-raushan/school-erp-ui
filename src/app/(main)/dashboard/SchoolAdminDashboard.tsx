"use client";

import { BookOpen, CalendarDays } from "lucide-react";
import { useAdminDashboardPage } from "@/hooks/useAdminDashboardPage";
import {
  AlertList,
  AttendanceTrendCard,
  BarListCard,
  DashSection,
  DashboardColumns,
  DashboardError,
  DashboardHero,
  DashboardRoot,
  DashboardSkeleton,
  DashboardSplit,
  DonutCard,
  KpiGrid,
  KpiTile,
  ListCard,
  MoneyCard,
  QuickActions,
} from "@/components/ui/dashboard";

export function SchoolAdminDashboard() {
  const vm = useAdminDashboardPage();

  return (
    <DashboardRoot>
      <DashboardHero
        eyebrow={vm.eyebrow}
        greeting={vm.greeting}
        title={vm.title}
        chips={vm.chips}
        stat={vm.hasData ? vm.heroStat : null}
      />

      {vm.error && <DashboardError message="Couldn't load the latest numbers. Pull to refresh or try again." />}

      {vm.isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashSection title="Quick actions">
            <QuickActions actions={vm.actions} />
          </DashSection>

          <AlertList alerts={vm.alerts} />

          <DashSection title="At a glance">
            <KpiGrid>
              {vm.kpis.map((kpi) => (
                <KpiTile key={kpi.key} kpi={kpi} />
              ))}
            </KpiGrid>
          </DashSection>

          <DashSection title="Insights">
            <DashboardSplit
              main={
                <>
                  {vm.trend.length > 0 && <AttendanceTrendCard data={vm.trend} />}
                  {vm.classRows.length > 0 && (
                    <BarListCard title="Class-wise students" description="Enrollment per class" rows={vm.classRows} unit="students" />
                  )}
                </>
              }
              aside={
                <>
                  <MoneyCard title="Fee collection" description="Billed vs collected" rows={vm.feeRows} progress={vm.feeProgress} />
                  <MoneyCard title="Finance" description="Income vs expenses" rows={vm.financeRows} />
                  {vm.gender.length > 0 && <DonutCard title="Gender split" data={vm.gender} />}
                  {vm.admissions.length > 0 && <DonutCard title="Admission enquiries" data={vm.admissions} />}
                </>
              }
            />
          </DashSection>

          <DashSection title="Coming up">
            <DashboardColumns>
              <ListCard title="Upcoming exams" icon={CalendarDays} accent="amber" items={vm.exams} emptyText="No upcoming exams" />
              <ListCard title="Events & holidays" icon={CalendarDays} accent="pink" items={vm.events} emptyText="Nothing scheduled" />
            </DashboardColumns>
            <ListCard title="Recent homework" icon={BookOpen} accent="blue" items={vm.homework} emptyText="No homework assigned recently" />
          </DashSection>
        </>
      )}
    </DashboardRoot>
  );
}
