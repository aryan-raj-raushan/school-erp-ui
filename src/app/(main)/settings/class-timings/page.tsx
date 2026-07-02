'use client';

import { useClassTimings } from '@/hooks/useClassTimings';
import {
  Div,
  P,
  Spinner,
  PageHeader,
  PageCol,
  EmptyState,
  ResponsiveSelect,
} from '@/components/ui';
import { CLASS_TIMINGS_PAGE } from '@/constants/school-settings.constants';

export default function ClassTimingsPage() {
  const { classes, timings, isLoading, savingClassId, getOverrideForClass, setClassTiming } = useClassTimings();

  if (isLoading) {
    return (
      <PageCol>
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      </PageCol>
    );
  }

  return (
    <PageCol>
      <PageHeader
        title={CLASS_TIMINGS_PAGE.title}
        subtitle={CLASS_TIMINGS_PAGE.subtitle}
      />

      {classes.length === 0 ? (
        <EmptyState
          title="No classes found"
          description="Create classes first to assign timing overrides"
        />
      ) : (
        <Div variant="card" type="col" gap="none">
          {classes.map((cls) => (
            <Div
              key={cls.id}
              type="row"
              justify="between"
              align="center"
              padding="p-4"
            >
              <Div type="col" gap="xs">
                <P color="default" weight="medium">{cls.name}</P>
                <P size="xs">
                  {getOverrideForClass(cls.id)
                    ? `Using: ${timings.find((t) => t.id === getOverrideForClass(cls.id))?.name ?? 'Custom'}`
                    : 'Using school default timing'}
                </P>
              </Div>
              <Div type="row" align="center" gap="sm">
                {savingClassId === cls.id && <Spinner size="sm" />}
                <ResponsiveSelect
                  value={getOverrideForClass(cls.id) ?? ''}
                  onChange={(e) => setClassTiming(cls.id, e.target.value || null)}
                  disabled={savingClassId === cls.id}
                  customPlaceholder="School Default"
                  options={timings.map((t) => ({ value: t.id, label: t.name }))}
                />
              </Div>
            </Div>
          ))}
        </Div>
      )}
    </PageCol>
  );
}
