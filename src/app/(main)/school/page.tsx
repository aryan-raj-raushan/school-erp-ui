'use client';

import { useRouter } from 'next/navigation';
import { useSchoolDashboard } from '@/hooks/useSchoolDashboard';
import { DASHBOARD_STAT_CONFIG, SETUP_STEPS, SCHOOL_DASHBOARD_PAGE } from '@/constants';
import { Div, H1, H2, P, StatCard, SetupStep } from '@/components/ui';

export default function SchoolDashboardPage() {
  const router = useRouter();
  const { user, currentYear, stats, setupSteps, showSetup } = useSchoolDashboard();

  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="xs">
        <H1>{SCHOOL_DASHBOARD_PAGE.welcomePrefix} {user?.first_name ?? SCHOOL_DASHBOARD_PAGE.defaultName}</H1>
        <P>
          {currentYear
            ? `${SCHOOL_DASHBOARD_PAGE.currentYearPrefix} ${currentYear.name}`
            : SCHOOL_DASHBOARD_PAGE.noYearMessage}
        </P>
      </Div>

      <Div type="grid" cols={3} gap="md" responsive>
        {DASHBOARD_STAT_CONFIG.map((config) => {
          const stat = stats.find((s) => s.key === config.key)!;
          return (
            <StatCard
              key={config.key}
              iconKey={config.iconKey}
              label={config.label}
              value={stat.value}
              sub={stat.sub}
              onClick={() => router.push(config.route)}
            />
          );
        })}
      </Div>

      {showSetup && (
        <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-6">
          <H2>{SCHOOL_DASHBOARD_PAGE.gettingStartedTitle}</H2>
          <P>{SCHOOL_DASHBOARD_PAGE.gettingStartedDesc}</P>
          <Div type="col" gap="sm">
            {SETUP_STEPS.map((step, i) => {
              const state = setupSteps.find((s) => s.key === step.key)!;
              return (
                <SetupStep
                  key={step.key}
                  n={i + 1}
                  done={state.done}
                  label={step.label}
                  route={step.route}
                />
              );
            })}
          </Div>
        </Div>
      )}
    </Div>
  );
}
