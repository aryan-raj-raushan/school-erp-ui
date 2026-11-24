"use client";

import { BookOpen, CalendarDays } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { useSessionState } from "@/hooks/useSessionState";
import { useAdminDashboardPage } from "@/hooks/useAdminDashboardPage";
import { SetupChecklist } from "@/components/onboarding/SetupChecklist";
import {
  AlertList,
  AttendanceTrendCard,
  BarListCard,
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
import { PunchInCard } from "@/components/attendance/PunchInCard";

const DASHBOARD_TABS = [
  { value: "glance", label: "At a glance" },
  { value: "upcoming", label: "Coming up" },
  { value: "insights", label: "Insights" },
  { value: "actions", label: "Quick actions" },
] as const;

type DashboardTab = (typeof DASHBOARD_TABS)[number]["value"];

export function SchoolAdminDashboard() {
  const vm = useAdminDashboardPage();
  const [tab, setTab] = useSessionState<DashboardTab>("dashboard:tab", "glance");
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
        action={<PunchInCard variant="hero" />}
      />

      <div className="md:hidden">
        <PunchInCard />
      </div>

      <SetupChecklist />

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

          <Tabs options={DASHBOARD_TABS} value={tab} onChange={setTab} className="w-full max-w-xl" />

          {tab === "glance" && (
            <KpiGrid dense>
              {vm.secondaryKpis.map((kpi) => (
                <KpiTile key={kpi.key} kpi={kpi} dense />
              ))}
            </KpiGrid>
          )}

          {tab === "upcoming" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ListCard title="Upcoming exams" icon={CalendarDays} accent="amber" items={vm.exams} emptyText="No upcoming exams" />
              <ListCard title="Events & holidays" icon={CalendarDays} accent="pink" items={vm.events} emptyText="Nothing scheduled" />
              <ListCard title="Recent homework" icon={BookOpen} accent="blue" items={vm.homework} emptyText="No homework assigned recently" />
            </div>
          )}

          {tab === "insights" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {vm.classRows.length > 0 && (
                <div className="md:col-span-2">
                  <BarListCard title="Class-wise students" description="Enrollment per class" rows={vm.classRows} unit="students" />
                </div>
              )}
              <MoneyCard title="Finance" description="Income vs expenses" rows={vm.financeRows} />
              {vm.gender.length > 0 && <DonutCard title="Gender split" data={vm.gender} />}
              {vm.admissions.length > 0 && <DonutCard title="Admission enquiries" data={vm.admissions} />}
            </div>
          )}

          {tab === "actions" && <QuickActions actions={vm.actions} />}
        </>
      )}
    </DashboardRoot>
  );
}
