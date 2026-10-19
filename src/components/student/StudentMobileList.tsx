"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Eye,
  Pencil,
  Phone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
} from "lucide-react";
import {
  ActionSheet,
  Badge,
  ListAvatar,
  MobileListCard,
  MobileListScreen,
} from "@/components/ui";
import { useStudentsInfinite } from "@/hooks/useStudentsInfinite";
import { useStudentFilterConfig } from "@/hooks/useStudentFilterConfig";
import {
  STATUS_BADGE,
  STUDENT_PAGE,
  STUDENT_ROUTES,
} from "@/constants/students.constants";
import type { StudentFilters, StudentListItem } from "@/types/students.types";

function fullName(student: StudentListItem) {
  return `${student.first_name} ${student.last_name ?? ""}`.trim();
}

function classLabel(student: StudentListItem) {
  return [student.class_name, student.section_name].filter(Boolean).join(" - ");
}

function metaLine(student: StudentListItem) {
  return [
    classLabel(student),
    student.roll_number ? `Roll ${student.roll_number}` : null,
    student.admission_number ? `Adm ${student.admission_number}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function StudentMobileList() {
  const router = useRouter();
  const [actionTarget, setActionTarget] = useState<StudentListItem | null>(
    null,
  );

  const list = useStudentsInfinite();

  const filterConfig = useStudentFilterConfig(
    list.filters,
    list.updateFilters,
  );

  return (
    <>
      <MobileListScreen
        filterFields={filterConfig.filterFields}
        filterValues={filterConfig.filterValues}
        onFilterChange={(next) =>
          filterConfig.onChange(next as Partial<StudentFilters>)
        }
        onFilterClear={filterConfig.onClear}
        filterSheetTitle="Filter students"
        onRefresh={list.refresh}
        countLabel={`${list.total} ${list.total === 1 ? "student" : "students"}`}
        isLoading={list.isLoading}
        isEmpty={list.items.length === 0}
        emptyIcon={<Users size={28} />}
        emptyTitle="No students yet"
        emptyDescription="Add your first student to get started."
        emptyFilteredTitle="No matching students"
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        fab={{
          label: STUDENT_PAGE.buttons.addStudent,
          onClick: () => router.push(STUDENT_ROUTES.createNew),
        }}
      >
        <ul className="flex flex-col gap-2.5">
          {list.items.map((student) => (
            <li key={student.id}>
              <MobileListCard
                leading={
                  <ListAvatar
                    src={student.profile_image}
                    name={fullName(student)}
                  />
                }
                title={fullName(student)}
                subtitle={metaLine(student) || "No class assigned"}
                badge={
                  student.status !== "ACTIVE" ? (
                    <Badge variant={STATUS_BADGE[student.status]}>
                      {student.status}
                    </Badge>
                  ) : undefined
                }
                muted={!student.is_enabled}
                onClick={() => router.push(STUDENT_ROUTES.view(student.id))}
                onMore={() => setActionTarget(student)}
                moreLabel={`Actions for ${fullName(student)}`}
              />
            </li>
          ))}
        </ul>
      </MobileListScreen>

      <ActionSheet
        isOpen={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget ? fullName(actionTarget) : undefined}
        subtitle={actionTarget ? metaLine(actionTarget) : undefined}
        actions={
          actionTarget
            ? [
                {
                  label: "View profile",
                  icon: <Eye size={18} />,
                  onClick: () =>
                    router.push(STUDENT_ROUTES.view(actionTarget.id)),
                },
                {
                  label: "Edit",
                  icon: <Pencil size={18} />,
                  onClick: () =>
                    router.push(STUDENT_ROUTES.edit(actionTarget.id)),
                },
                {
                  label: "Call",
                  icon: <Phone size={18} />,
                  hidden: !actionTarget.phone_number,
                  onClick: () => {
                    window.location.href = `tel:${actionTarget.phone_number}`;
                  },
                },
                {
                  label: "Generate ID card",
                  icon: <CreditCard size={18} />,
                  onClick: () =>
                    router.push(
                      `${STUDENT_ROUTES.generate}?studentId=${actionTarget.id}`,
                    ),
                },
                {
                  label: actionTarget.is_enabled ? "Disable" : "Enable",
                  icon: actionTarget.is_enabled ? (
                    <ToggleRight size={18} />
                  ) : (
                    <ToggleLeft size={18} />
                  ),
                  onClick: () => void list.toggleEnabled(actionTarget),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  confirm: {
                    title: `Delete ${fullName(actionTarget)}?`,
                    description:
                      "All records for this student will be removed. This cannot be undone.",
                    confirmLabel: "Delete",
                  },
                  onClick: () => void list.deleteStudent(actionTarget),
                },
              ]
            : []
        }
      />
    </>
  );
}