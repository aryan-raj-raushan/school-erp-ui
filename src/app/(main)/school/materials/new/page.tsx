'use client';

import { useCreateStudyMaterial } from '@/hooks/useCreateStudyMaterial';
import {
  Div, Button, H2, FormField, Input, Select, Textarea, Spinner,
  PageHeader, PageCol,
} from '@/components/ui';

const CONTENT_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'file', label: 'Image And PDF' },
  { value: 'youtube', label: 'Youtube Link' },
] as const;

export default function NewStudyMaterialPage() {
  const {
    form, years, classes, subjects,
    isLoadingData, isSubmitting, isUploading,
    contentType, fileRef,
    handleSubmit, handleBack,
  } = useCreateStudyMaterial();

  const { register, formState: { errors }, watch } = form;

  if (isLoadingData && classes.length === 0) {
    return (
      <Div type="col" align="center" justify="center" className="py-20">
        <Spinner />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      <PageHeader
        title="Create Study Document"
        actions={<Button variant="outline" onClick={handleBack}>Cancel</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="lg">
          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Course Details
            </H2>

            <FormField label="Session *" error={errors.academic_year_id?.message}>
              <Select {...register('academic_year_id')} defaultValue="">
                <option value="">Select session</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Class *" error={errors.class_id?.message}>
              <Select {...register('class_id')} defaultValue="">
                <option value="">Select class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>

            <FormField label="Subject">
              <Select {...register('subject_id')} defaultValue="" disabled={!watch('class_id')}>
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>

            <FormField label="Document Title *" error={errors.title?.message}>
              <Input {...register('title')} placeholder="Enter Title" />
            </FormField>
          </Div>

          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Content
            </H2>

            <Div type="col" gap="sm">
              <p className="text-sm font-medium text-foreground">Study Document Content</p>
              <Div type="row" gap="xs">
                {CONTENT_TYPE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={contentType === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => form.setValue('content_type', opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Div>
            </Div>

            {contentType === 'text' && (
              <FormField label="Study Document Text *">
                <Textarea
                  {...register('content_text')}
                  placeholder="Type something"
                  rows={8}
                />
              </FormField>
            )}

            {contentType === 'file' && (
              <FormField label="Upload File (Image / PDF) *">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormField>
            )}

            {contentType === 'youtube' && (
              <FormField label="YouTube Link *">
                <Input {...register('youtube_url')} placeholder="https://www.youtube.com/watch?v=..." />
              </FormField>
            )}
          </Div>

          <Div type="row" justify="end" gap="sm">
            <Button type="button" variant="outline" onClick={handleBack}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || isUploading}>Save</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
