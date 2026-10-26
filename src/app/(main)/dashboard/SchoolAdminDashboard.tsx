"use client";

import { BookOpen, CalendarDays } from "lucide-react";
import { useAdminDashboardPage } from "@/hooks/useAdminDashboardPage";
import {
  AlertList,
  AttendanceTrendCard,
  BarListCard,
  DashSection,
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
  const feeCard = (
    <MoneyCard title="Fee collection" description="Billed vs collected" rows={vm.feeRows} progress={vm.feeProgress} />
  );

  return (
    <DashboardRoot onRefresh={vm.refresh}>
      <DashboardHero
        compact
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
          <AlertList alerts={vm.alerts} inline />

          <KpiGrid>
            {vm.primaryKpis.map((kpi) => (
              <KpiTile key={kpi.key} kpi={kpi} />
            ))}
          </KpiGrid>

          {vm.trend.length > 0 ? (
            <DashboardSplit
              main={<AttendanceTrendCard data={vm.trend} compact />}
              aside={feeCard}
            />
          ) : (
            feeCard
          )}

          <DashSection title="School at a glance">
            <KpiGrid dense>
              {vm.secondaryKpis.map((kpi) => (
                <KpiTile key={kpi.key} kpi={kpi} dense />
              ))}
            </KpiGrid>
          </DashSection>

          <DashSection title="Coming up">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              <ListCard title="Upcoming exams" icon={CalendarDays} accent="amber" items={vm.exams} emptyText="No upcoming exams" />
              <ListCard title="Events & holidays" icon={CalendarDays} accent="pink" items={vm.events} emptyText="Nothing scheduled" />
              <ListCard title="Recent homework" icon={BookOpen} accent="blue" items={vm.homework} emptyText="No homework assigned recently" />
            </div>
          </DashSection>

          <DashSection title="Quick actions">
            <QuickActions actions={vm.actions} />
          </DashSection>

          <DashSection title="Insights">
            <DashboardSplit
              main={
                vm.classRows.length > 0 && (
                  <BarListCard title="Class-wise students" description="Enrollment per class" rows={vm.classRows} unit="students" />
                )
              }
              aside={
                <>
                  <MoneyCard title="Finance" description="Income vs expenses" rows={vm.financeRows} />
                  {vm.gender.length > 0 && <DonutCard title="Gender split" data={vm.gender} />}
                  {vm.admissions.length > 0 && <DonutCard title="Admission enquiries" data={vm.admissions} />}
                </>
              }
            />
          </DashSection>
        </>
      )}
    </DashboardRoot>
  );
}
