import { SCHOOL_DASHBOARD_PAGE } from '@/constants';

export default function SchoolDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {SCHOOL_DASHBOARD_PAGE.title}
      </h1>
      <p className="text-sm text-zinc-500">{SCHOOL_DASHBOARD_PAGE.description}</p>
    </div>
  );
}
