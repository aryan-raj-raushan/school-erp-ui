"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StudentsService } from "@/services/students-v2.service";
import { UploadsService } from "@/services/uploads.service";
import {
  studentFormSchema,
  type StudentFormValues,
} from "@/lib/validations/students.validation";
import type { StudentFull } from "@/types/students.types";
import { STUDENT_ROUTES } from "@/constants/students-v2.constants";

export function useStudentDetail(id?: string) {
  const router = useRouter();
  const isNew = id === "create-new";

  const [student, setStudent] = useState<StudentFull | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      dial_code: "+91",
      nationality: "Indian",
      status: "ACTIVE",
      is_enabled: true,
      hostel_info: { hostel_required: false },
      parents: [],
      documents: [],
    },
  });

  const parentsArray = useFieldArray({
    control: form.control,
    name: "parents",
  });
  const documentsArray = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const fetchStudent = useCallback(async () => {
    if (!id || isNew) return;
    setIsLoading(true);
    try {
      const data: any = await StudentsService.getById(id);
      setStudent(data);
      setProfileImageUrl(data.student.profile_image ?? null);
      // Reset form with fetched data
      form.reset({
        first_name: data.student.first_name,
        last_name: data.student.last_name ?? "",
        date_of_birth: data.student.date_of_birth ?? "",
        gender: data.student.gender ?? undefined,
        blood_group: data.student.blood_group ?? undefined,
        religion: data.student.religion ?? undefined,
        category: data.student.category ?? undefined,
        caste: data.student.caste ?? "",
        nationality: data.student.nationality ?? "Indian",
        aadhaar_number: data.student.aadhaar_number ?? "",
        id_card_number: data.student.id_card_number ?? "",
        height_cm: data.student.height_cm ?? "",
        weight_kg: data.student.weight_kg ?? "",
        profile_image: data.student.profile_image ?? "",
        dial_code: data.student.dial_code ?? "+91",
        phone_number: data.student.phone_number ?? "",
        email: data.student.email ?? "",
        status: data.student.status,
        is_enabled: data.student.is_enabled,
        academic_info: data.academicInfo
          ? {
              academic_year_id: data.academicInfo.academic_year_id,
              class_id: data.academicInfo.class_id,
              section_id: data.academicInfo.section_id ?? "",
              admission_number: data.academicInfo.admission_number,
              registration_number: data.academicInfo.registration_number ?? "",
              roll_number: data.academicInfo.roll_number ?? "",
              joining_date: data.academicInfo.joining_date ?? "",
            }
          : undefined,
        previous_academics: data.previousAcademics
          ? {
              previous_school_name:
                data.previousAcademics.previous_school_name ?? "",
              previous_class: data.previousAcademics.previous_class ?? "",
              passing_year: data.previousAcademics.passing_year ?? "",
              total_marks: data.previousAcademics.total_marks ?? "",
              grade: data.previousAcademics.grade ?? "",
              board: data.previousAcademics.board ?? "",
              tc_number: data.previousAcademics.tc_number ?? "",
            }
          : undefined,
        address: data.address
          ? {
              address: data.address.address ?? "",
              city: data.address.city ?? "",
              state: data.address.state ?? "",
              pincode: data.address.pincode ?? "",
              country: data.address.country ?? "India",
            }
          : undefined,
        hostel_info: data.hostelInfo
          ? {
              hostel_required: data.hostelInfo.hostel_required,
              hostel_name: data.hostelInfo.hostel_name ?? "",
              room_number: data.hostelInfo.room_number ?? "",
            }
          : { hostel_required: false },
        parents: data.parents.map((p:any) => ({
          relation: p.relation,
          first_name: p.first_name,
          last_name: p.last_name ?? "",
          email: p.email ?? "",
          dial_code: p.dial_code,
          phone_number: p.phone_number,
          alternate_phone: p.alternate_phone ?? "",
          occupation: p.occupation ?? "",
          qualification: p.qualification ?? undefined,
          annual_income: p.annual_income ?? "",
          aadhaar_number: p.aadhaar_number ?? "",
          is_primary: p.is_primary,
          can_pickup: p.can_pickup,
        })),
        documents: data.documents.map((d:any) => ({
          document_name: d.document_name,
          file_type: d.file_type,
          document_link: d.document_link,
          original_filename: d.original_filename ?? "",
          remarks: d.remarks ?? "",
        })),
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load student",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew, form]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  async function handleImageUpload(file: File, studentId: string) {
    setIsUploadingImage(true);
    try {
      const { url } = await StudentsService.uploadProfileImage(file, studentId);
      setProfileImageUrl(url);
      form.setValue('profile_image', url);
      if (!isNew) {
        await StudentsService.update(studentId, { profile_image: url });
        toast.success('Profile photo updated');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingImage(false);
    }
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isNew && id) {
      handleImageUpload(file, id);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
      (imageInputRef as any)._pendingFile = file;
    }
  }

  async function handleSubmit(values: StudentFormValues) {
    try {
      // Clean up empty strings to undefined
      const clean = <T extends object>(obj: T): T =>
        Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, v === "" ? undefined : v]),
        ) as T;

      const payload = {
        ...clean(values),
        academic_info: values.academic_info
          ? clean(values.academic_info)
          : undefined,
        previous_academics: values.previous_academics
          ? clean(values.previous_academics)
          : undefined,
        address: values.address ? clean(values.address) : undefined,
        hostel_info: values.hostel_info ? clean(values.hostel_info) : undefined,
        parents: values.parents?.map(clean),
        documents: values.documents?.map(clean),
      };

      if (isNew) {
        const created = await StudentsService.create(payload as any);
        const pendingFile = (imageInputRef as any)._pendingFile as File | undefined;
        if (pendingFile) {
          await handleImageUpload(pendingFile, created.student.id);
        }
        toast.success(`Student "${created.student.first_name}" created`);
        router.push(STUDENT_ROUTES.view(created.student.id));
      } else {
        const updated = await StudentsService.update(id!, payload as any);
        setStudent(updated);
        toast.success("Student updated successfully");
        setIsEditing(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleDocumentUpload(file: File, docIndex: number) {
    setIsUploading(true);
    try {
      const result = await UploadsService.uploadDocument(file, {
        reference_id: String(docIndex),
        reference_type: "student_document",
        document_type: file.type.includes("pdf") ? "pdf" : "image",
      });
      form.setValue(`documents.${docIndex}.document_link`, result.url);
      form.setValue(`documents.${docIndex}.original_filename`, file.name);
      form.setValue(
        `documents.${docIndex}.file_type`,
        file.type.includes("pdf") ? "PDF" : "IMAGE",
      );
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteDocument(docId: string) {
    if (!id || isNew) return;
    try {
      await StudentsService.deleteDocument(id, docId);
      toast.success("Document removed");
      await fetchStudent();
    } catch {
      toast.error("Failed to remove document");
    }
  }

  return {
    student,
    isLoading,
    isEditing,
    setIsEditing,
    isNew,
    form,
    parentsArray,
    documentsArray,
    isUploading,
    profileImageUrl,
    isUploadingImage,
    imageInputRef,
    onImageChange,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting,
    handleDocumentUpload,
    deleteDocument,
    refetch: fetchStudent,
  };
}
