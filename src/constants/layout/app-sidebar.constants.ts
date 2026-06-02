import {
  Users,
  FileText,
  Settings,
  CircleHelp,
  ClipboardCheck,
  Wallet,
  CalendarDays,
  Building2,
  CircleDollarSign,
} from "lucide-react";
import { Role } from "@/types";
import { NavItemConfig } from "@/types/layout/app-sidebar";

export const APP_NAV_USER = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export const APP_NAV_MAIN: NavItemConfig[] = [
  {
    title: "Team Management",
    url: "#",
    icon: Users,
    items: [
      {
        title: "Students",
        url: "/students",
      },
      {
        title: "Staffs",
        url: "/staffs",
      },
      {
        title: "Parents",
        url: "/parents",
      },
    ],
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
  },
  {
    title: "Attendance",
    url: "#",
    icon: ClipboardCheck,
    items: [
      {
        title: "Students Attendance",
        url: "/attendance/students",
      },
      {
        title: "Students Attendance Report",
        url: "/attendance/report/students",
      },
      {
        title: "Staffs Attendance",
        url: "/attendance/staffs",
      },
      {
        title: "Staffs Attendance Report",
        url: "/attendance/report/staffs",
      },
    ],
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
  },
  {
    title: "Finance",
    url: "#",
    icon: Wallet,
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
    items: [
      {
        title: "Finance Types",
        url: "/finance/types",
      },
      {
        title: "Finance Generation",
        url: "/finance/generate",
      },
      {
        title: "Finance Receipts",
        url: "/finance/receipts",
      },
    ],
  },
  {
    title: "Examinations",
    url: "#",
    icon: FileText,
    items: [
      {
        title: "Exam Setup",
        url: "/exams/master-data",
      },
      {
        title: "Exam Rules",
        url: "/exams/policy",
      },
      {
        title: "Eligibile Students",
        url: "/exams/eligible-students",
      },
      {
        title: "Exam Schedule",
        url: "/exams/timetable",
      },
      {
        title: "Rooms Allocation",
        url: "/exams/rooms",
      },
      {
        title: "Seat Allocation",
        url: "/exams/seating-arrangement",
      },
      {
        title: "Hall Tickets",
        url: "/exams/admit-cards",
      },
    ],
  },
  {
    title: "Leave",
    url: "/leave",
    icon: CalendarDays,
    roles: [Role.SUPER_ADMIN, Role.ADMIN],

    items: [
      {
        title: "Leave Policy",
        url: "/leave/policy",
      },
      {
        title: "Leave Provision",
        url: "/leave/provision",
      },
      {
        title: "Leave Management",
        url: "/leave",
      },
    ],
  },
];

export const APP_NAV_SECONDARY: NavItemConfig[] = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Schools",
    url: "/schools",
    icon: Building2,
    roles: [Role.SUPER_ADMIN]
  },
  {
    title: "Subscription",
    url: "/subscriptions",
    icon: CircleDollarSign,
    roles: [Role.SUPER_ADMIN]
  },

  {
    title: "Get Help",
    url: "/help",
    icon: CircleHelp,
  },
];
