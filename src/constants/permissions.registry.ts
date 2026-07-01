/**
 * FRONTEND SINGLETON PERMISSION REGISTRY
 *
 * Mirror of backend permissions.registry.ts — same slugs, same structure.
 *
 * To add a new module:
 *   1. Add resource entry here (same as backend)
 *   2. Add label to RESOURCE_LABELS below
 *   3. Use in UI: <PermissionGate permission={PERMISSIONS.library.view}>
 *   4. Add to sidebar nav: permissions: [PERMISSIONS.library.view]
 */
export const PERMISSIONS = {
  students:       { view: 'students.view',       create: 'students.create',       update: 'students.update',       delete: 'students.delete'       },
  staff:          { view: 'staff.view',           create: 'staff.create',          update: 'staff.update',          delete: 'staff.delete',          offboard: 'staff.offboard' },
  parents:        { view: 'parents.view',         create: 'parents.create',        update: 'parents.update'                                                                      },
  fees:           { view: 'fees.view',            create: 'fees.create',           update: 'fees.update',           delete: 'fees.delete',           approve: 'fees.approve'  },
  exams:          { view: 'exams.view',           create: 'exams.create',          update: 'exams.update',          delete: 'exams.delete'          },
  attendance:     { view: 'attendance.view',      create: 'attendance.create',     update: 'attendance.update'                                                                   },
  leave:          { view: 'leave.view',           approve: 'leave.approve',        reject: 'leave.reject'                                                                        },
  departments:    { view: 'departments.view',     create: 'departments.create',    update: 'departments.update',    delete: 'departments.delete'    },
  classes:        { view: 'classes.view',         create: 'classes.create',        update: 'classes.update',        delete: 'classes.delete'        },
  subjects:       { view: 'subjects.view',        create: 'subjects.create',       update: 'subjects.update',       delete: 'subjects.delete'       },
  timetable:      { view: 'timetable.view',       create: 'timetable.create',      update: 'timetable.update',      delete: 'timetable.delete'      },
  classSubjectTeachers: { view: 'classSubjectTeachers.view', create: 'classSubjectTeachers.create', update: 'classSubjectTeachers.update', delete: 'classSubjectTeachers.delete' },
  syllabus:       { view: 'syllabus.view',        create: 'syllabus.create',       update: 'syllabus.update',       delete: 'syllabus.delete'       },
  homework:       { view: 'homework.view',        create: 'homework.create',       update: 'homework.update',       delete: 'homework.delete'       },
  admissions:     { view: 'admissions.view',      create: 'admissions.create',     update: 'admissions.update',     delete: 'admissions.delete'     },
  reports:        { view: 'reports.view',         export: 'reports.export'                                                                                                       },
  settings:       { view: 'settings.view',        update: 'settings.update'                                                                                                      },
  roles:          { view: 'roles.view',           create: 'roles.create',          update: 'roles.update',          delete: 'roles.delete'          },
  communications:  { view: 'communications.view',  create: 'communications.create',  update: 'communications.update'                                                                },
  holidays:        { view: 'holidays.view',         create: 'holidays.create',        update: 'holidays.update',        delete: 'holidays.delete'       },
  events:          { view: 'events.view',           create: 'events.create',          update: 'events.update',          delete: 'events.delete'         },
  academic_years:  { view: 'academic_years.view',   create: 'academic_years.create',  update: 'academic_years.update'                                   },
  finance:          { view: 'finance.view',           create: 'finance.create',          update: 'finance.update',          delete: 'finance.delete'          },
  salary:           { view: 'salary.view',            create: 'salary.create',           update: 'salary.update',           delete: 'salary.delete',           process: 'salary.process' },
  // ← ADD NEW MODULE HERE (keep in sync with backend)
} as const;

/** Human-readable labels for each resource group in the permission matrix */
export const RESOURCE_LABELS: Record<string, string> = {
  students:       'Students',
  staff:          'Staff',
  parents:        'Parents',
  fees:           'Fees & Finance',
  exams:          'Exams & Results',
  attendance:     'Attendance',
  leave:          'Leave Management',
  departments:    'Departments',
  classes:        'Classes',
  subjects:       'Subjects',
  timetable:      'Timetable',
  classSubjectTeachers: 'Subject-Teacher Map',
  syllabus:       'Syllabus',
  homework:       'Homework',
  admissions:     'Admissions',
  reports:        'Reports',
  settings:       'School Settings',
  roles:          'Roles & Permissions',
  communications:  'Communications',
  holidays:        'Holidays',
  events:          'School Events',
  academic_years:  'Academic Years',
  finance:         'Finance Management',
  salary:          'Salary & Payroll',
};

/** Human-readable labels for individual actions */
export const ACTION_LABELS: Record<string, string> = {
  view:     'View',
  create:   'Create',
  update:   'Edit',
  delete:   'Delete',
  approve:  'Approve',
  reject:   'Reject',
  export:   'Export',
  offboard: 'Offboard',
  process:  'Process',
};

export type AppPermission = {
  [K in keyof typeof PERMISSIONS]: (typeof PERMISSIONS)[K][keyof (typeof PERMISSIONS)[K]];
}[keyof typeof PERMISSIONS];
