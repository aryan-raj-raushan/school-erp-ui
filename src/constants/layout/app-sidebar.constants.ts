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
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Palette,
  LayoutDashboard,
  MessageSquareMore,
  ShieldCheck,
  Landmark,
  BookMarked,
  BanknoteArrowUp,
  Receipt,
  Wifi,
  BarChart2,
  Bell,
  ScrollText,
} from "lucide-react";
import { PERMISSIONS } from "@/constants/permissions.registry";
import { Role } from "@/types";
import { NavItemConfig } from "@/types/layout/app-sidebar";

export const APP_NAV_USER = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

const SUPER_ROLES = [Role.SUPER_ADMIN, Role.ADMIN];

export const APP_NAV_MAIN: NavItemConfig[] = [
  /* ---------------------------------------------------
  Shared — visible to all authenticated school users
  --------------------------------------------------- */
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },

  /* ---------------------------------------------------
  Student
  --------------------------------------------------- */

  {
    title: "Students",
    url: "#",
    icon: GraduationCap,
    permissions: [PERMISSIONS.students.view],
    items: [
      {
        title: "Add Student",
        url: "/students/create-new",
        permissions: [PERMISSIONS.students.view],
      },
      {
        title: "Student Record",
        url: "/students",
        permissions: [PERMISSIONS.students.view],
      },
      {
        title: "Parents",
        url: "/parents",
        permissions: [PERMISSIONS.parents.view],
      },
      {
        title: "Generate Id/Pick-Up Card",
        url: "/students/generate",
        permissions: [PERMISSIONS.students.view],
      },
      {
        title: "Attendance",
        url: "/attendance/students",
        permissions: [
          PERMISSIONS.attendance.view,
          PERMISSIONS.attendance.create,
        ],
      },
      {
        title: "Attendance Report",
        url: "/attendance/report/students",
        permissions: [PERMISSIONS.attendance.view],
      },
      {
        title: "Gate Pass",
        url: "/attendance/gate-pass",
        permissions: [PERMISSIONS.attendance.view],
      },
    ],
  },

  /* ---------------------------------------------------
  Staff
  --------------------------------------------------- */

  {
    title: "Staff",
    url: "#",
    icon: Users,
    permissions: [PERMISSIONS.staff.view],
    items: [
      { title: "Staff", url: "/staffs", permissions: [PERMISSIONS.staff.view] },
      {
        title: "Attendance",
        url: "/attendance/staffs",
        permissions: [
          PERMISSIONS.attendance.view,
          PERMISSIONS.attendance.create,
        ],
      },
      {
        title: "Attendance Report",
        url: "/attendance/report/staffs",
        permissions: [PERMISSIONS.attendance.view],
      },
    ],
  },

  {
    title: "Admission Enquiry",
    url: "#",
    icon: MessageSquareMore,
    permissions: [PERMISSIONS.admissions.view, PERMISSIONS.admissions.create],
    items: [
      {
        title: "Add Enquiry",
        url: "/admissions/create-new",
        permissions: [PERMISSIONS.admissions.create],
      },
      {
        title: "Enquiry List",
        url: "/admissions",
        permissions: [PERMISSIONS.admissions.view],
      },
      {
        title: "Today Followup Admissions",
        url: "/admissions/follow-up",
        permissions: [PERMISSIONS.admissions.view],
      },
      {
        title: "Enquiry Source",
        url: "/admissions/source",
        permissions: [PERMISSIONS.admissions.view],
      },
    ],
  },

  /* ---------------------------------------------------
  Attendance
  --------------------------------------------------- */
  // {
  //   title: "Attendance",
  //   url: "#",
  //   icon: ClipboardCheck,
  //   permissions: [
  //     PERMISSIONS.attendance.view,
  //     PERMISSIONS.attendance.create,
  //     PERMISSIONS.attendance.update,
  //   ],
  //   items: [
  //     {
  //       title: "Students Attendance",
  //       url: "/attendance/students",
  //       permissions: [
  //         PERMISSIONS.attendance.view,
  //         PERMISSIONS.attendance.create,
  //       ],
  //     },
  //     {
  //       title: "Staff Attendance",
  //       url: "/attendance/staffs",
  //       permissions: [
  //         PERMISSIONS.attendance.view,
  //         PERMISSIONS.attendance.create,
  //       ],
  //     },
  //     {
  //       title: "Gate Passes",
  //       url: "/attendance/gate-pass",
  //       permissions: [PERMISSIONS.attendance.view],
  //     },
  //   ],
  // },
  // {
  //   title: "Attendance Report",
  //   url: "#",
  //   icon: CalendarCheck,
  //   permissions: [PERMISSIONS.attendance.view],
  //   items: [
  //     {
  //       title: "Students Attendance Reports",
  //       url: "/attendance/report/students",
  //       permissions: [PERMISSIONS.attendance.view],
  //     },
  //     {
  //       title: "Staffs Attendance Reports",
  //       url: "/attendance/report/staffs",
  //       permissions: [PERMISSIONS.attendance.view],
  //     },
  //   ],
  // },

  /* ---------------------------------------------------
  Academics
  --------------------------------------------------- */
  {
    title: "Academics",
    url: "#",
    icon: FileText,
    permissions: [
      PERMISSIONS.homework.view,
      PERMISSIONS.syllabus.view,
      PERMISSIONS.timetable.view,
      PERMISSIONS.classSubjectTeachers.view,
    ],
    items: [
      {
        title: "Homework",
        url: "/school/homework",
        permissions: [PERMISSIONS.homework.view],
      },
      {
        title: "Subject-Teacher Map",
        url: "/school/subject-teacher-map",
        permissions: [PERMISSIONS.classSubjectTeachers.view],
      },
      {
        title: "Study Materials",
        url: "/school/materials",
        permissions: [PERMISSIONS.syllabus.view],
      },
      {
        title: "Syllabus",
        url: "/school/syllabus",
        permissions: [PERMISSIONS.syllabus.view],
      },
      {
        title: "Time Table",
        url: "/school/timetable",
        permissions: [PERMISSIONS.timetable.view],
      },
      {
        title: "Employee Schedule",
        url: "/school/timetable/employee",
        permissions: [PERMISSIONS.timetable.view],
      },
      {
        title: "Day Schedule",
        url: "/school/timetable/session",
        permissions: [PERMISSIONS.timetable.view],
      },
    ],
  },

  /* ---------------------------------------------------
  Fee Management
  --------------------------------------------------- */
  {
    title: "Fee Management",
    url: "#",
    icon: Receipt,
    permissions: [
      PERMISSIONS.fees.view,
      PERMISSIONS.fees.create,
      PERMISSIONS.fees.approve,
    ],
    items: [
      {
        title: "Fee Setup",
        url: "/fees/setup",
        permissions: [PERMISSIONS.fees.view],
      },
      {
        title: "Fee Payments",
        url: "/fees/payments",
        permissions: [PERMISSIONS.fees.view],
      },
    ],
  },

  {
    title: "Finance Accounts",
    url: "#",
    icon: Landmark,
    permissions: [PERMISSIONS.finance.view, PERMISSIONS.finance.create],
    items: [
      {
        title: "Setup",
        url: "/finance/setup",
        permissions: [PERMISSIONS.finance.view],
      },
      {
        title: "Ledger",
        url: "/finance/ledger",
        permissions: [PERMISSIONS.finance.view],
      },
    ],
  },

  {
    title: "Salary & Payroll",
    url: "#",
    icon: BanknoteArrowUp,
    permissions: [
      PERMISSIONS.salary.view,
      PERMISSIONS.salary.create,
      PERMISSIONS.salary.process,
    ],
    items: [
      {
        title: "Salary Management",
        url: "/hr/salary",
        permissions: [PERMISSIONS.salary.view],
      },
    ],
  },

  /* ---------------------------------------------------
  Exams
  --------------------------------------------------- */
  {
    title: "Examinations",
    url: "#",
    icon: BookOpen,
    permissions: [PERMISSIONS.exams.view, PERMISSIONS.exams.create],
    items: [
      {
        title: "Exam Grading",
        url: "/exam/grading",
        permissions: [PERMISSIONS.exams.create],
      },
      {
        title: "Exam List",
        url: "/exam/exams",
        permissions: [PERMISSIONS.exams.view],
      },
      {
        title: "Exam Schedule",
        url: "/exam/schedule",
        permissions: [PERMISSIONS.exams.view],
      },
      {
        title: "Exam Attendance",
        url: "/exam/attendance",
        permissions: [PERMISSIONS.exams.view],
      },
      {
        title: "Exam Sitting Plan",
        url: "/exam/sitting-plan",
        permissions: [PERMISSIONS.exams.view],
      },
    ],
  },

  /* ---------------------------------------------------
  Result
  --------------------------------------------------- */
  {
    title: "Result",
    url: "#",
    icon: BarChart2,
    permissions: [PERMISSIONS.exams.view, PERMISSIONS.exams.create],
    items: [
      {
        title: "Marks",
        url: "/result/marks",
        permissions: [PERMISSIONS.exams.create],
      },
      {
        title: "Report Card",
        url: "/result/report-cards",
        permissions: [PERMISSIONS.exams.view],
      },
    ],
  },

  /* ---------------------------------------------------
  Leave
  --------------------------------------------------- */
  {
    title: "Leave",
    url: "#",
    icon: CalendarDays,
    permissions: [PERMISSIONS.leave.view, PERMISSIONS.leave.approve],
    items: [
      {
        title: "Leave Type",
        url: "/leave/type",
        permissions: [PERMISSIONS.leave.approve],
      },
      {
        title: "Leave Assigned",
        url: "/leave/assigned",
        permissions: [PERMISSIONS.leave.view],
      },
      {
        title: "Leave Apply",
        url: "/leave/apply",
        permissions: [PERMISSIONS.leave.view],
      },
      {
        title: "Leave Application",
        url: "/leave/applications",
        permissions: [PERMISSIONS.leave.view],
      },
      {
        title: "Student Leave",
        url: "/leave/student",
        permissions: [PERMISSIONS.leave.approve],
      },
      {
        title: "Teacher Leave",
        url: "/leave/teacher",
        permissions: [PERMISSIONS.leave.approve],
      },
      {
        title: "Leave Balances",
        url: "/leave/balance",
        permissions: [PERMISSIONS.leave.approve],
      },
    ],
  },

  /* ---------------------------------------------------
  School Setup — each sub-item has its own permission
  --------------------------------------------------- */
  {
    title: "School Setup",
    url: "#",
    icon: GraduationCap,
    permissions: [
      PERMISSIONS.academic_years.create,
      PERMISSIONS.academic_years.update,
      PERMISSIONS.classes.create,
      PERMISSIONS.classes.update,
      PERMISSIONS.subjects.create,
      PERMISSIONS.subjects.update,
      PERMISSIONS.holidays.create,
      PERMISSIONS.holidays.update,
      PERMISSIONS.events.create,
      PERMISSIONS.events.update,
    ],
    items: [
      {
        title: "Academic Years",
        url: "/school/academic-years",
        permissions: [
          PERMISSIONS.academic_years.create,
          PERMISSIONS.academic_years.update,
        ],
      },
      {
        title: "Classes & Sections",
        url: "/school/classes",
        permissions: [PERMISSIONS.classes.create, PERMISSIONS.classes.update],
      },
      {
        title: "Subjects",
        url: "/school/subjects",
        permissions: [PERMISSIONS.subjects.create, PERMISSIONS.subjects.update],
      },
      {
        title: "Holidays & Events",
        url: "/school/holidays-events",
        permissions: [PERMISSIONS.holidays.create, PERMISSIONS.events.create],
      },
    ],
  },

  {
    title: "Roles & Permissions",
    url: "/school/roles",
    icon: ShieldCheck,
    permissions: [
      PERMISSIONS.roles.view,
      PERMISSIONS.roles.create,
      PERMISSIONS.roles.update,
    ],
  },
  {
    title: "RFID Setup",
    url: "/rfid-setup",
    icon: Wifi,
  },

  /* ---------------------------------------------------
  Super admin only
  --------------------------------------------------- */
  {
    title: "Schools",
    url: "/schools",
    icon: Building2,
    roles: SUPER_ROLES,
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: CircleDollarSign,
    roles: SUPER_ROLES,
  },
];

export const APP_NAV_SECONDARY: NavItemConfig[] = [
  {
    title: "Appearance",
    url: "/appearance",
    icon: Palette,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    permissions: [PERMISSIONS.settings.view],
    items: [
      {
        title: "School Profile",
        url: "/settings/school-profile",
        permissions: [PERMISSIONS.settings.view],
      },
      {
        title: "School Config",
        url: "/settings/school-config",
        permissions: [PERMISSIONS.settings.view],
      },
      {
        title: "Timing Schedules",
        url: "/settings/timings",
        permissions: [PERMISSIONS.settings.view],
      },
      {
        title: "Class Timings",
        url: "/settings/class-timings",
        permissions: [PERMISSIONS.settings.view],
      },
      {
        title: "Academic Year",
        url: "/settings/academic-year",
        permissions: [PERMISSIONS.settings.view],
      },
      {
        title: "Class & Section",
        url: "/settings/class-section",
        permissions: [PERMISSIONS.settings.view],
      },
      {
        title: "Notification Rules",
        url: "/settings/notification-rules",
        permissions: [PERMISSIONS.settings.view],
      },
      {
        title: "Audit Log",
        url: "/settings/audit-log",
        permissions: [PERMISSIONS.settings.view],
      },
    ],
  },
  {
    title: "Get Help",
    url: "/help",
    icon: CircleHelp,
  },
];
