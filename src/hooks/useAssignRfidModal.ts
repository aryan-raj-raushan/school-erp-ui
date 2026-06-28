'use client';

import { useState, useEffect } from 'react';
import { AcademicYearsService } from '@/services/academic-years.service';
import { ClassesService, SectionsService } from '@/services/classes.service';
import { StudentsService } from '@/services/students.service';
import { StaffService } from '@/services/staff.service';
import type { AcademicYear, Class, Section, Student, Staff } from '@/types';

export function useAssignRfidModal() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [yearId, setYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [staffId, setStaffId] = useState('');

  useEffect(() => {
    AcademicYearsService.list().then((r) => setYears(r.items)).catch(() => {});
    StaffService.list({ limit: 100 }).then((r) => setStaffList(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    setClassId(''); setClasses([]); setSectionId(''); setSections([]); setStudentId(''); setStudentList([]);
    if (!yearId) return;
    ClassesService.list({ academic_year_id: yearId, limit: 100 }).then((r) => setClasses(r.items)).catch(() => {});
  }, [yearId]);

  useEffect(() => {
    setSectionId(''); setSections([]); setStudentId(''); setStudentList([]);
    if (!classId) return;
    SectionsService.list({ class_id: classId, limit: 100 }).then((r) => setSections(r.items)).catch(() => {});
  }, [classId]);

  useEffect(() => {
    setStudentId(''); setStudentList([]);
    if (!classId) return;
    const params = sectionId
      ? { section_id: sectionId, limit: 200 }
      : { class_id: classId, limit: 200 };
    StudentsService.list(params).then((r) => setStudentList(r.items)).catch(() => {});
  }, [classId, sectionId]);

  return {
    years, classes, sections, studentList, staffList,
    yearId, setYearId,
    classId, setClassId,
    sectionId, setSectionId,
    studentId, setStudentId,
    staffId, setStaffId,
  };
}
