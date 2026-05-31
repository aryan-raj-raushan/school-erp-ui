'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSchoolSchema, type CreateSchoolFormValues } from '@/lib/validations/schools.validation';
import type { CreateSchoolPayload } from '@/services/schools.service';
import { useSchools } from './useSchools';

export function useCreateSchoolForm() {
  const [showModal, setShowModal] = useState(false);
  const { createSchool, isCreating } = useSchools();

  const form = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { dial_code: '+91' },
  });

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    form.reset();
  }

  async function handleSubmit(values: CreateSchoolFormValues) {
    const payload: CreateSchoolPayload = {
      name: values.name,
      ...(values.code && { code: values.code }),
      ...(values.email && { email: values.email }),
      ...(values.contact_number && { contact_number: values.contact_number, dial_code: values.dial_code }),
      ...(values.website && { website: values.website }),
      ...(values.address && { address: values.address }),
      ...(values.city && { city: values.city }),
      ...(values.state && { state: values.state }),
      ...(values.pincode && { pincode: values.pincode }),
      ...(values.board_type && { board_type: values.board_type }),
    };

    await createSchool(payload);
    closeModal();
  }

  return {
    form,
    showModal,
    openModal,
    closeModal,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: isCreating,
  };
}
