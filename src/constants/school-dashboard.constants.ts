import { ROUTES } from './app.constants';

export type DashboardStatKey = 'academic-years' | 'classes' | 'students';

export interface DashboardStatConfig {
  key: DashboardStatKey;
  label: string;
  iconKey: DashboardStatKey;
  route: string;
}

export const DASHBOARD_STAT_CONFIG: DashboardStatConfig[] = [
  { key: 'academic-years', label: 'Academic Years', iconKey: 'academic-years', route: ROUTES.academicYears },
  { key: 'classes', label: 'Classes', iconKey: 'classes', route: ROUTES.classes },
  { key: 'students', label: 'Students', iconKey: 'students', route: ROUTES.students },
];

export const SETUP_STEPS = [
  { key: 'academic-years' as DashboardStatKey, label: 'Create an academic year', route: ROUTES.academicYears },
  { key: 'classes' as DashboardStatKey, label: 'Add classes and sections', route: ROUTES.classes },
  { key: 'students' as DashboardStatKey, label: 'Enrol your first student', route: ROUTES.students },
];

export const SCHOOL_DASHBOARD_PAGE = {
  welcomePrefix: 'Welcome,',
  defaultName: 'School Admin',
  currentYearPrefix: 'Current Year:',
  noYearMessage: 'No academic year set. Create one to get started.',
  gettingStartedTitle: 'Get Started',
  gettingStartedDesc: 'Set up your school by following these steps:',
} as const;
