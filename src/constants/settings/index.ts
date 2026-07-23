import {
  CalendarDays,
  BookOpen,
  Settings2,
  Building2,
  Clock,
  Bell,
  ScrollText,
  type LucideIcon,
  Users,
  CalendarRange,
  ClipboardList,
  History,
} from "lucide-react";

export interface SettingItem {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
}


export const SETTINGS_ITEMS: SettingItem[] = [
  {
    slug: "school-profile",
    label: "School Profile",
    description:
      "Manage school information, logo, contact details, principal, affiliation, and UDISE code.",
    icon: Building2,
  },
  {
    slug: "school-config",
    label: "School Config",
    description:
      "Configure attendance, grading, session rules, timezone, and other school-wide preferences.",
    icon: Settings2,
  },
  {
    slug: "academic-years",
    label: "Academic Year",
    description:
      "Create and manage academic sessions with start and end dates.",
    icon: CalendarDays,
  },
  {
    slug: "academic-year-rollover",
    label: "Academic Year Rollover",
    description:
      "Promote students, archive records, and roll over data to the next academic year.",
    icon: History,
  },
  {
    slug: "timings",
    label: "Timing Schedules",
    description:
      "Define school schedules, shifts, working days, and timing templates.",
    icon: Clock,
  },
  {
    slug: "classes",
    label: "Class & Sections",
    description:
      "Manage classes, sections, capacities, and classroom organization.",
    icon: Users,
  },
  {
    slug: "class-timings",
    label: "Class Timings",
    description:
      "Assign or customize schedules and timings for individual classes.",
    icon: CalendarRange,
  },
  {
    slug: "subjects",
    label: "Subjects",
    description:
      "Create, edit, and organize subjects offered across different classes.",
    icon: BookOpen,
  },
  {
    slug: "holidays-events",
    label: "Holiday & Events",
    description:
      "Manage holidays, school events, vacations, and special working days.",
    icon: ClipboardList,
  },
  {
    slug: "notification-rules",
    label: "Notification Rules",
    description:
      "Configure automated notifications for attendance, exams, fees, and announcements.",
    icon: Bell,
  },
  {
    slug: "audit-log",
    label: "Audit Log",
    description:
      "View a complete history of changes, user actions, and system activities.",
    icon: ScrollText,
  },
];
