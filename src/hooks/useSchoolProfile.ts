'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolProfileService, type UpdateSchoolProfilePayload } from '@/services/school-profile.service';
import { UploadsService } from '@/services/uploads.service';
import { SCHOOL_PROFILE_PAGE } from '@/constants/school-profile.constants';
import { useSchoolBrandStore } from '@/store/school.store';
import type { School } from '@/types';

// Strip empty strings, null and undefined so backend enum/regex validators don't fail on blank fields.
function sanitizePayload(payload: UpdateSchoolProfilePayload): UpdateSchoolProfilePayload {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== '' && v !== null && v !== undefined),
  ) as UpdateSchoolProfilePayload;
}

export function useSchoolProfile() {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<UpdateSchoolProfilePayload>({});
  const setBrand = useSchoolBrandStore((s) => s.setBrand);

  const syncBrand = useCallback((data: School) => {
    setBrand({ name: data.name, logo_url: data.logo_url ?? null });
  }, [setBrand]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await SchoolProfileService.get();
      setSchool(data);
      syncBrand(data);
      setForm({
        name: data.name,
        code: data.code ?? '',
        udise_code: data.udise_code ?? '',
        affiliation_number: data.affiliation_number ?? '',
        established_year: data.established_year ?? undefined,
        timezone: data.timezone ?? 'Asia/Kolkata',
        board_type: data.board_type ?? '',
        marking_system: data.marking_system ?? '',
        email: data.email ?? '',
        contact_number: data.contact_number ?? '',
        dial_code: data.dial_code ?? '+91',
        website: data.website ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        country: data.country ?? 'India',
        pincode: data.pincode ?? '',
        logo_url: data.logo_url ?? '',
        lat: data.lat != null ? String(data.lat) : '',
        lng: data.lng != null ? String(data.lng) : '',
        principal_name: data.principal_name ?? '',
        principal_email: data.principal_email ?? '',
        principal_phone: data.principal_phone ?? '',
      });
    } catch {
      toast.error('Failed to load school profile');
    } finally {
      setIsLoading(false);
    }
  }, [syncBrand]);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = useCallback(<K extends keyof UpdateSchoolProfilePayload>(
    key: K,
    value: UpdateSchoolProfilePayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const updated = await SchoolProfileService.update(sanitizePayload(form));
      setSchool(updated);
      syncBrand(updated);
      toast.success(SCHOOL_PROFILE_PAGE.saved);
    } catch {
      toast.error('Failed to update school profile');
    } finally {
      setIsSaving(false);
    }
  }, [form, syncBrand]);

  const uploadLogo = useCallback(async (file: File) => {
    const schoolId = school?.id;
    if (!schoolId) throw new Error('School not loaded');
    const result = await UploadsService.uploadImage(file, {
      reference_id: schoolId,
      reference_type: 'school',
      document_type: 'logo',
    });
    updateField('logo_url', result.url);
    setBrand({ name: form.name ?? school?.name ?? '', logo_url: result.url });
    await SchoolProfileService.update({ logo_url: result.url });
    toast.success('Logo updated');
  }, [school, form.name, updateField, setBrand]);

  return {
    school,
    form,
    isLoading,
    isSaving,
    updateField,
    save,
    uploadLogo,
  };
}
