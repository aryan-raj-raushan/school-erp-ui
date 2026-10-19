"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  BottomSheet,
  ListAvatar,
  MobileSelectField,
} from "@/components/ui";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useStudents } from "@/hooks/useStudentV2";
import { haptic } from "@/lib/haptics";

export interface StudentPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudentId: string | null;
  onSelect: (studentId: string) => void;
}

const MAX_STUDENTS = 200;

/**
 * Bottom sheet for choosing one student: pick year / class / section, then
 * search and tap a student. Reusable wherever a screen needs "which student?".
 */
export function StudentPickerSheet({
  isOpen,
  onClose,
  selectedStudentId,
  onSelect,
}: StudentPickerSheetProps) {
  const [query, setQuery] = useState("");

  const {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    handleClassChange,
    handleSectionChange,
    isLoadingClasses,
  } = useAcademicClassSection();

  const { students, isLoading, updateFilters } = useStudents({
    is_enabled: true,
    limit: MAX_STUDENTS,
  });

  function changeClass(classId: string) {
    handleClassChange(classId);
    updateFilters({
      academic_year_id: selectedAcademicYearId || undefined,
      class_id: classId || undefined,
      section_id: undefined,
    });
  }

  function changeSection(sectionId: string) {
    handleSectionChange(sectionId);
    updateFilters({ section_id: sectionId || undefined });
  }

  const visible = query
    ? students.filter((s) =>
        `${s.first_name} ${s.last_name ?? ""} ${s.roll_number ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : students;

  function choose(id: string) {
    void haptic("light");
    onSelect(id);
    onClose();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Choose a student" maxHeight="90dvh">
      <div className="flex flex-col gap-3 pt-1">
        <MobileSelectField
          label="Academic year"
          value={selectedAcademicYearId}
          onChange={setSelectedAcademicYearId}
          placeholder="Select year"
          options={years.map((y) => ({
            value: y.id,
            label: `${y.name}${y.is_current ? " (Current)" : ""}`,
          }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <MobileSelectField
            label="Class"
            value={selectedClassId}
            onChange={changeClass}
            disabled={!selectedAcademicYearId || isLoadingClasses}
            placeholder="Select"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <MobileSelectField
            label="Section"
            value={selectedSectionId}
            onChange={changeSection}
            disabled={!selectedClassId}
            placeholder="All"
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>

        {selectedClassId && (
          <>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or roll number"
              className="h-12 rounded-2xl border border-border bg-transparent px-4 text-base outline-none focus:border-primary"
            />
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading students…</p>
            ) : visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No students found</p>
            ) : (
              <ul>
                {visible.map((student) => {
                  const name = `${student.first_name} ${student.last_name ?? ""}`.trim();
                  const active = student.id === selectedStudentId;
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        onClick={() => choose(student.id)}
                        className={`flex min-h-16 w-full items-center gap-3 rounded-xl px-2 text-left active:bg-muted ${active ? "bg-primary/5" : ""}`}
                      >
                        <ListAvatar src={student.profile_image} name={name} size={44} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">{name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {student.roll_number ? `Roll ${student.roll_number}` : "No roll number"}
                          </span>
                        </span>
                        {active && <Check size={18} className="text-primary-text" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}
