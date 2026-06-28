"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AttendanceService } from "@/services/attendance.service";
import { ClassesService, SectionsService } from "@/services/classes.service";
import { StudentsService } from "@/services/students.service";
import { SchoolEventsService } from "@/services/school-events.service";
import { useAcademicYears } from "./useAcademicYears";
import type { AttendanceStatus, Student, Section, Class } from "@/types";
import type { SchoolEvent } from "@/types/setting/school-events.types";
import type { AttendanceSession } from "@/constants/attendance.constants";

type AttendanceMap = Record<
  string,
  {
    status?: AttendanceStatus;
    remarks: string;
    isLate: boolean;
    existingId?: string;
  }
>;

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function useAttendance() {
  const { years, currentYear } = useAcademicYears();
  const [classes, setClasses] = useState<Class[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedClassSectionId, setSelectedClassSectionId] =
    useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState<AttendanceSession>('MORNING');
  const [holidayEvent, setHolidayEvent] = useState<SchoolEvent | null>(null);

  // Set default academic year from current year
  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, selectedAcademicYearId]);

  // Load classes when academic year selected
  const fetchClasses = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    setIsLoadingClasses(true);
    try {
      const res = await ClassesService.list({
        academic_year_id: selectedAcademicYearId,
      });
      setClasses(res.items);
      setAllSections(res.sections);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load classes",
      );
    } finally {
      setIsLoadingClasses(false);
    }
  }, [selectedAcademicYearId]);

  // Load sections when class selected
  // const fetchSections = useCallback(async () => {
  //   if (!selectedClassId) {
  //     setSections([]);
  //     return;
  //   }
  //   setIsLoadingSections(true);
  //   try {
  //     const res = await SectionsService.list({ class_id: selectedClassId });
  //     setSections(res.items);
  //   } catch (err: unknown) {
  //     toast.error(
  //       err instanceof Error ? err.message : "Failed to load sections",
  //     );
  //   } finally {
  //     setIsLoadingSections(false);
  //   }
  // }, [selectedClassId]);

  // Load students + existing attendance when section + date selected
  const fetchStudentsAndAttendance = useCallback(async () => {
    if (!selectedClassSectionId) return;
    setIsLoadingStudents(true);
    try {
      const [studentsRes, existingRecords] = await Promise.all([
        StudentsService.list({
          section_id: selectedClassSectionId,
          limit: 100,
        }),
        AttendanceService.getSectionDateAttendance(
          selectedClassSectionId,
          date,
        ),
      ]);

      setStudents(studentsRes.items);

      const map: AttendanceMap = {};
      studentsRes.items.forEach((s) => {
        map[s.id] = {
          // status: "PRESENT",
          remarks: "",
          isLate: false,
        };
      });
      existingRecords.forEach((r) => {
        if (map[r.student_id]) {
          map[r.student_id] = {
            status: r.status,
            remarks: r.remarks ?? "",
            isLate: r.is_late,
            existingId: r.id,
          };
        }
      });
      setAttendanceMap(map);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load attendance",
      );
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedClassSectionId, date]);

  function setStudentLate(studentId: string, isLate: boolean) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        isLate,
        remarks: isLate
          ? "Student has arrived late"
          : prev[studentId]?.remarks === "Student has arrived late"
            ? ""
            : prev[studentId]?.remarks,
      },
    }));
  }

  function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedSectionId("");
    setSelectedClassSectionId("");
    setSections(classId ? allSections.filter((s) => s.class_id === classId) : []);
    setStudents([]);
    setAttendanceMap({});
  }

  function handleSectionChange(sectionId: string) {
    setSelectedSectionId(sectionId);
    setSelectedClassSectionId(sectionId);
    setStudents([]);
    setAttendanceMap({});
  }

  function setStudentStatus(studentId: string, status: AttendanceStatus) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  }

  function setStudentRemarks(studentId: string, remarks: string) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  }

  function markAll(status: AttendanceStatus) {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], status };
      });
      return next;
    });
  }

  async function saveAttendance() {
    if (
      !selectedClassSectionId ||
      !selectedAcademicYearId ||
      students.length === 0
    )
      return;

    const unmarkedStudents = students.filter(
      (s) => !attendanceMap[s.id]?.status,
    );

    if (unmarkedStudents.length > 0) {
      toast.error(`${unmarkedStudents.length} students have not been marked`);
      return;
    }
    setIsSaving(true);
    try {
      const entries = students.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id].status!,
        is_late: attendanceMap[s.id].isLate ?? false,
        ...(attendanceMap[s.id].remarks && {
          remarks: attendanceMap[s.id].remarks,
        }),
      }));

      await AttendanceService.mark({
        date,
        session,
        academic_year_id: selectedAcademicYearId,
        class_section_id: selectedClassSectionId,
        entries,
      });

      toast.success("Attendance saved");
      await fetchStudentsAndAttendance();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save attendance",
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Holiday check — runs whenever date changes
  useEffect(() => {
    let cancelled = false;
    async function checkHoliday() {
      try {
        const res = await SchoolEventsService.list({ from_date: date, to_date: date, type: 'HOLIDAY' });
        if (!cancelled) setHolidayEvent(res.items.length > 0 ? res.items[0] : null);
      } catch {
        if (!cancelled) setHolidayEvent(null);
      }
    }
    checkHoliday();
    return () => { cancelled = true; };
  }, [date]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClassSectionId) fetchStudentsAndAttendance();
  }, [selectedClassSectionId, date, fetchStudentsAndAttendance]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    selectedClassSectionId,
    selectedClass,
    handleClassChange,
    handleSectionChange,
    date,
    setDate,
    students,
    attendanceMap,
    isLoadingClasses,
    isLoadingSections,
    isLoadingStudents,
    isSaving,
    setStudentStatus,
    setStudentRemarks,
    markAll,
    saveAttendance,
    setStudentLate,
    session,
    setSession,
    holidayEvent,
    isHoliday: holidayEvent !== null,
  };
}
