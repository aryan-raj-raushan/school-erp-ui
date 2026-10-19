"use client";

import { usePlatformDashboardPage } from "@/hooks/usePlatformDashboardPage";
import {
  AlertList,
  DashSection,
  DashboardHero,
  DashboardRoot,
  KpiGrid,
  KpiTile,
  QuickActions,
} from "@/components/ui/dashboard";

export function SuperAdminDashboard() {
  const vm = usePlatformDashboardPage();

  return (
    <DashboardRoot>
      <DashboardHero eyebrow={vm.eyebrow} greeting={vm.greeting} title={vm.title} chips={vm.chips} />

      <DashSection title="Quick actions">
        <QuickActions actions={vm.actions} />
      </DashSection>

      <AlertList alerts={vm.alerts} />

      <DashSection title="Platform overview">
        <KpiGrid>
          {vm.kpis.map((kpi) => (
            <KpiTile key={kpi.key} kpi={kpi} loading={vm.isLoading} />
          ))}
        </KpiGrid>
      </DashSection>
    </DashboardRoot>
  );
}
