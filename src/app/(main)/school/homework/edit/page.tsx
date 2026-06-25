'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';
import { useEditHomework } from '@/hooks/useEditHomework';
import { HOMEWORK_PAGE, HOMEWORK_STATUS_OPTIONS } from '@/constants';
import {
  Div, Button, H2,
  FormField, Input, Select, Textarea,
  CheckboxLabel, Spinner,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell, TableEmptyRow,
  Badge,
  PageHeader, PageCol,
} from '@/components/ui';
import { Paperclip, ExternalLink, X } from 'lucide-react';

function EditHomeworkPageInner() {
  const _searchParams = useSearchParams();
  const id = _searchParams.get('id') ?? '';

  const {
    form, years, classes, classDetails, subjects,
    isLoadingData, savedAttachments, newAttachments, fileInputRef,
    isSubmitting,
    handleSubmit, handleFileChange, removeSavedAttachment, removeNewAttachment,
    handleBack,
  } = useEditHomework(id);

  const { register, formState: { errors }, watch, setValue } = form;

  if (isLoadingData) {
    return (
      <Div type="col" align="center" justify="center" className="py-20">
        <Spinner />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      <PageHeader
        title={HOMEWORK_PAGE.form.editTitle}
        actions={<Button variant="outline" onClick={handleBack}>{HOMEWORK_PAGE.form.cancel}</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="lg">
          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Assignment Details
            </H2>

            <FormField label={HOMEWORK_PAGE.form.class} error={errors.class_id?.message}>
              <Select {...register('class_id')} defaultValue="">
                <option value="">{HOMEWORK_PAGE.placeholders.selectClass}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>

            <FormField label={HOMEWORK_PAGE.form.classDetail}>
              <Select {...register('class_detail_id')} defaultValue="" disabled={!watch('class_id')}>
                <option value="">{HOMEWORK_PAGE.placeholders.selectClassDetail}</option>
                {classDetails.map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
              </Select>
            </FormField>

            <FormField label={HOMEWORK_PAGE.form.subject} error={errors.subject_id?.message}>
              <Select {...register('subject_id')} defaultValue="" disabled={!watch('class_id')}>
                <option value="">{HOMEWORK_PAGE.placeholders.selectSubject}</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>

            <FormField label={HOMEWORK_PAGE.form.title} error={errors.title?.message}>
              <Input placeholder={HOMEWORK_PAGE.placeholders.title} {...register('title')} />
            </FormField>

            <Div type="grid" cols={2} gap="md">
              <FormField label={HOMEWORK_PAGE.form.homeworkDate} error={errors.homework_date?.message}>
                <Input type="date" {...register('homework_date')} />
              </FormField>
              <FormField label={HOMEWORK_PAGE.form.dueDate} error={errors.due_date?.message}>
                <Input type="date" {...register('due_date')} />
              </FormField>
            </Div>

            <FormField label={HOMEWORK_PAGE.form.status} error={errors.status?.message}>
              <Select {...register('status')}>
                {HOMEWORK_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </FormField>
          </Div>

          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Content & Options
            </H2>

            <Div type="row" gap="lg">
              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="send_notification"
                  checked={watch('send_notification')}
                  onChange={(e) => setValue('send_notification', e.target.checked)}
                />
                <CheckboxLabel htmlFor="send_notification">{HOMEWORK_PAGE.form.sendNotification}</CheckboxLabel>
              </Div>
              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="student_upload_allowed"
                  checked={watch('student_upload_allowed')}
                  onChange={(e) => setValue('student_upload_allowed', e.target.checked)}
                />
                <CheckboxLabel htmlFor="student_upload_allowed">{HOMEWORK_PAGE.form.studentUploadAllowed}</CheckboxLabel>
              </Div>
            </Div>

            <FormField label={HOMEWORK_PAGE.form.description}>
              <Textarea
                placeholder={HOMEWORK_PAGE.placeholders.description}
                rows={5}
                {...register('description')}
              />
            </FormField>
          </Div>

          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <Div type="row" align="center" justify="between">
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {HOMEWORK_PAGE.form.attachments}
              </H2>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-4 h-4 mr-1" />
                Attach File
              </Button>
            </Div>

            <p className="text-xs text-muted-foreground -mt-2">{HOMEWORK_PAGE.form.attachmentsHint}</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeaderCell>{HOMEWORK_PAGE.attachmentTable.fileName}</TableHeaderCell>
                  <TableHeaderCell>{HOMEWORK_PAGE.attachmentTable.status}</TableHeaderCell>
                  <TableHeaderCell>{HOMEWORK_PAGE.attachmentTable.preview}</TableHeaderCell>
                  <TableHeaderCell>{HOMEWORK_PAGE.attachmentTable.view}</TableHeaderCell>
                  <TableHeaderCell>{HOMEWORK_PAGE.attachmentTable.remove}</TableHeaderCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {savedAttachments.length === 0 && newAttachments.length === 0 ? (
                  <TableEmptyRow colSpan={5}>No files attached</TableEmptyRow>
                ) : (
                  <>
                    {savedAttachments.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell primary>{att.file_name}</TableCell>
                        <TableCell><Badge variant="success">Saved</Badge></TableCell>
                        <TableCell>
                          {att.file_type !== 'pdf' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={att.file_url} alt={att.file_name} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <a href={att.file_url} target="_blank" rel="noreferrer">
                            <Button type="button" variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeSavedAttachment(att.id)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {newAttachments.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell primary>{att.file.name}</TableCell>
                        <TableCell>
                          {att.status === 'uploading' && <Badge variant="default">Uploading…</Badge>}
                          {att.status === 'done' && <Badge variant="success">Uploaded</Badge>}
                          {att.status === 'error' && <Badge variant="danger">Error</Badge>}
                        </TableCell>
                        <TableCell>
                          {att.status === 'done' && att.url && att.file_type !== 'pdf' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={att.url} alt={att.file.name} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {att.status === 'done' && att.url ? (
                            <a href={att.url} target="_blank" rel="noreferrer">
                              <Button type="button" variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeNewAttachment(att.id)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </Div>

          <Div type="row" justify="end" gap="sm">
            <Button type="button" variant="outline" onClick={handleBack}>{HOMEWORK_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{HOMEWORK_PAGE.form.update}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}

export default function EditHomeworkPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <EditHomeworkPageInner />
    </Suspense>
  );
}
