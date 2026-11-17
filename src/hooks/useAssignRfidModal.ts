'use client';

import { useState, useEffect } from 'react';
import {
  RfidService,
  type AssignableClass,
  type AssignableOverview,
  type AssignableStudent,
} from '@/services/rfid.service';
import { errorMessage } from '@/lib/api-error';

export function useAssignRfidModal() {
  const [overview, setOverview] = useState<AssignableOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [studentList, setStudentList] = useState<AssignableStudent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [classId, setClassIdState] = useState('');
  const [sectionId, setSectionIdState] = useState('');
  const [studentId, setStudentId] = useState('');
  const [staffId, setStaffId] = useState('');

  useEffect(() => {
    let active = true;
    RfidService.getAssignable()
      .then((data) => active && setOverview(data))
      .catch((err) => active && setLoadError(errorMessage(err, 'Could not load who still needs a card')));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!classId) return;
    let active = true;
    RfidService.getAssignableStudents(classId, sectionId || undefined)
      .then((items) => active && setStudentList(items))
      .catch(() => active && setStudentList([]))
      .finally(() => active && setIsLoadingStudents(false));
    return () => {
      active = false;
    };
  }, [classId, sectionId]);

  function setClassId(id: string) {
    setClassIdState(id);
    setSectionIdState('');
    setStudentId('');
    setStudentList([]);
    setIsLoadingStudents(!!id);
  }

  function setSectionId(id: string) {
    setSectionIdState(id);
    setStudentId('');
    setStudentList([]);
    setIsLoadingStudents(!!classId);
  }

  const classes: AssignableClass[] = overview?.classes ?? [];
  const sections = classes.find((c) => c.id === classId)?.sections ?? [];

  return {
    academicYear: overview?.academic_year ?? null,
    isLoadingOverview: !overview && !loadError,
    loadError,
    classes,
    sections,
    studentList,
    isLoadingStudents,
    staffList: overview?.staff ?? [],
    classId, setClassId,
    sectionId, setSectionId,
    studentId, setStudentId,
    staffId, setStaffId,
  };
}
