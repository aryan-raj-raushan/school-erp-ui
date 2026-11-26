'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolProfileService, type UpdateSchoolProfilePayload } from '@/services/school-profile.service';
import { UploadsService } from '@/services/uploads.service';
import { SCHOOL_PROFILE_PAGE } from '@/constants/school-profile.constants';
import { REGEX } from '@/constants/regex.constants';
import { useSchoolBrandStore } from '@/store/school.store';
import { usePincodeLookup } from '@/hooks/usePincodeLookup';
import type { School } from '@/types';
import { errorMessage } from '@/lib/api-error';

// Strip empty strings, null and undefined so backend enum/regex validators don't fail on blank fields.
function sanitizePayload(payload: UpdateSchoolProfilePayload): UpdateSchoolProfilePayload {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== '' && v !== null && v !== undefined),
  ) as UpdateSchoolProfilePayload;
}

export type SchoolProfileField = keyof UpdateSchoolProfilePayload;
export type SchoolProfileErrors = Partial<Record<SchoolProfileField, string>>;

const WEBSITE_PATTERN = /^https?:\/\/[^\s/$.?#][^\s]*\.[a-z]{2,}(\/\S*)?$/i;
const CURRENT_YEAR = new Date().getFullYear();

function validateField(key: SchoolProfileField, form: UpdateSchoolProfilePayload): string | undefined {
  const raw = form[key];
  const value = typeof raw === 'string' ? raw.trim() : raw;
  switch (key) {
    case 'name':
      return value ? undefined : 'School name is required';
    case 'email':
    case 'principal_email':
      return value && !REGEX.email.test(String(value)) ? 'Enter a valid email address, e.g. name@school.edu.in' : undefined;
    case 'contact_number':
    case 'principal_phone':
      return value && !REGEX.phoneIn.test(String(value)) ? 'Enter a 10-digit mobile number starting with 6-9' : undefined;
    case 'website':
      return value && !WEBSITE_PATTERN.test(String(value)) ? 'Enter a valid website, e.g. school.edu.in' : undefined;
    case 'udise_code':
      return value && !/^\d{11}$/.test(String(value)) ? 'UDISE code must be exactly 11 digits' : undefined;
    case 'pincode':
      return value && !REGEX.pincodeIn.test(String(value)) ? 'Pincode must be 6 digits and cannot start with 0' : undefined;
    case 'established_year':
      if (value === undefined || value === null || value === '') return undefined;
      return Number(value) < 1800 || Number(value) > CURRENT_YEAR
        ? `Year must be between 1800 and ${CURRENT_YEAR}`
        : undefined;
    default:
      return undefined;
  }
}

const VALIDATED_FIELDS: SchoolProfileField[] = [
  'name',
  'udise_code',
  'email',
  'contact_number',
  'website',
  'pincode',
  'established_year',
  'principal_email',
  'principal_phone',
];

export function useSchoolProfile() {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<SchoolProfileErrors>({});

  const [form, setForm] = useState<UpdateSchoolProfilePayload>({});
  const setBrand = useSchoolBrandStore((s) => s.setBrand);

  const syncBrand = useCallback((data: School) => {
    setBrand({ name: data.name, logo_url: data.logo_url ?? null });
  }, [setBrand]);

  const pincode = usePincodeLookup((details) => {
    setForm((prev) => ({ ...prev, city: details.city, state: details.state, country: details.country }));
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await SchoolProfileService.get();
      setSchool(data);
      syncBrand(data);
      setForm({
        name: data.name,
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
        principal_salutation: data.principal_salutation ?? '',
        principal_name: data.principal_name ?? '',
        principal_email: data.principal_email ?? '',
        principal_phone: data.principal_phone ?? '',
      });
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load school profile'));
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
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const touchField = useCallback((key: SchoolProfileField) => {
    setErrors((prev) => ({ ...prev, [key]: validateField(key, form) }));
    if (key === 'pincode' && !validateField('pincode', form) && form.pincode) {
      void pincode.lookup(String(form.pincode));
    }
  }, [form, pincode]);

  const updatePincode = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    updateField('pincode', digits);
    if (digits.length === 6) void pincode.lookup(digits);
  }, [updateField, pincode]);

  const save = useCallback(async () => {
    const nextErrors: SchoolProfileErrors = {};
    VALIDATED_FIELDS.forEach((key) => {
      const message = validateField(key, form);
      if (message) nextErrors[key] = message;
    });
    setErrors(nextErrors);
    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      toast.error(`Fix the highlighted fields: ${firstError}`);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await SchoolProfileService.update(sanitizePayload(form));
      setSchool(updated);
      syncBrand(updated);
      toast.success(SCHOOL_PROFILE_PAGE.saved);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update school profile'));
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
    errors,
    isLoading,
    isSaving,
    updateField,
    touchField,
    updatePincode,
    isLookingUpPincode: pincode.isLooking,
    pincodeLookupError: pincode.lookupError,
    save,
    uploadLogo,
  };
}
