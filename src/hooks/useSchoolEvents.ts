'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SchoolEventsService } from '@/services/school-events.service';
import { schoolEventSchema, type SchoolEventFormValues } from '@/lib/validations/settings/school-event.validation';
import type { SchoolEvent, SchoolEventFilters } from '@/types/setting/school-events.types';
import type { PaginationMeta } from '@/types';

export function useSchoolEvents(initialFilters: SchoolEventFilters = {}) {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<SchoolEventFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SchoolEventsService.list(filters);
      setEvents(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  function updateFilters(next: Partial<SchoolEventFilters>) {
    if ('search' in next) {
      const val = next.search ?? '';
      setSearchInput(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, search: val || undefined, page: 1 }));
      }, 400);
    } else {
      setFilters((prev) => ({ ...prev, ...next, page: 1 }));
    }
  }

  async function deleteEvent(id: string) {
    try {
      await SchoolEventsService.remove(id);
      toast.success('Deleted successfully');
      await fetchEvents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events, pagination, filters, searchInput, isLoading,
    updateFilters, deleteEvent, refetch: fetchEvents,
  };
}

export function useSchoolEventDetail(id?: string) {
  const isNew = id === 'create-new';
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);

  const form = useForm<SchoolEventFormValues>({
    resolver: zodResolver(schoolEventSchema),
    defaultValues: { type: 'EVENT', from_time: '', to_time: '', description: '' },
  });

  const fetchEvent = useCallback(async () => {
    if (!id || isNew) return;
    setIsLoading(true);
    try {
      const data = await SchoolEventsService.getById(id);
      setEvent(data);
      form.reset({
        name: data.name,
        type: data.type,
        academic_year_id: data.academic_year_id,
        description: data.description ?? '',
        from_date: data.from_date,
        from_time: data.from_time ?? '',
        to_date: data.to_date,
        to_time: data.to_time ?? '',
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew, form]);

  async function submit(values: SchoolEventFormValues): Promise<SchoolEvent | null> {
    try {
      const payload = {
        ...values,
        from_time: values.from_time || undefined,
        to_time: values.to_time || undefined,
        description: values.description || undefined,
      };
      if (isNew) {
        const created = await SchoolEventsService.create(payload);
        toast.success(`${created.name} created`);
        return created;
      } else {
        const updated = await SchoolEventsService.update(id!, payload);
        setEvent(updated);
        toast.success(`${updated.name} updated`);
        setIsEditing(false);
        return updated;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
      return null;
    }
  }

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event, isLoading, isEditing, setIsEditing, form, isNew,
    handleSubmit: form.handleSubmit(submit),
    isSubmitting: form.formState.isSubmitting,
  };
}