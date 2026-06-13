'use client';

import { use } from 'react';
import { useEditSyllabus } from '@/hooks/useEditSyllabus';
import { SYLLABUS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button, H2,
  FormField, Input, Select, Textarea,
  CheckboxLabel, Spinner,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge,
} from '@/components/ui';
import { Paperclip, ExternalLink, X } from 'lucide-react';


export default function EditSyllabusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    form, classes, classDetails, isLoadingData,
    savedAttachments, newAttachments, fileInputRef,
    isSubmitting,
    handleSubmit, handleFileChange, removeSavedAttachment, removeNewAttachment,
    toggleIsEnabled, handleBack,
  } = useEditSyllabus(id);

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
        title={SYLLABUS_PAGE.form.editTitle}
        actions={<Button variant="outline" onClick={handleBack}>{SYLLABUS_PAGE.form.cancel}</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="lg">
          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Syllabus Details
            </H2>

            <FormField label={SYLLABUS_PAGE.form.class} error={form.formState.errors.class_id?.message}>
              <Select {...form.register('class_id')}>
                <option value="">{SYLLABUS_PAGE.placeholders.selectClass}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>

            <FormField label={SYLLABUS_PAGE.form.classDetail} error={form.formState.errors.class_detail_id?.message}>
              <Select {...form.register('class_detail_id')} disabled={!form.watch('class_id')}>
                <option value="">{SYLLABUS_PAGE.placeholders.selectClassDetail}</option>
                {classDetails.map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
              </Select>
            </FormField>

            <FormField label={SYLLABUS_PAGE.form.title} error={form.formState.errors.title?.message}>
              <Input placeholder={SYLLABUS_PAGE.placeholders.title} {...form.register('title')} />
            </FormField>

            <Div type="row" align="center" gap="sm">
              <input type="checkbox" id="is_enabled" checked={form.watch('is_enabled')} onChange={toggleIsEnabled} />
              <CheckboxLabel htmlFor="is_enabled">{SYLLABUS_PAGE.form.isEnabled}</CheckboxLabel>
            </Div>

            <FormField label={SYLLABUS_PAGE.form.content} error={form.formState.errors.content?.message}>
              <Textarea
                placeholder={SYLLABUS_PAGE.placeholders.content}
                rows={6}
                {...form.register('content')}
              />
            </FormField>
          </Div>

          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <Div type="row" align="center" justify="between">
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {SYLLABUS_PAGE.form.attachments}
              </H2>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-4 h-4 mr-1" />
                Attach File
              </Button>
            </Div>

            <p className="text-xs text-muted-foreground -mt-2">{SYLLABUS_PAGE.form.attachmentsHint}</p>

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
                  <TableHeaderCell>{SYLLABUS_PAGE.attachmentTable.fileName}</TableHeaderCell>
                  <TableHeaderCell>{SYLLABUS_PAGE.attachmentTable.status}</TableHeaderCell>
                  <TableHeaderCell>{SYLLABUS_PAGE.attachmentTable.preview}</TableHeaderCell>
                  <TableHeaderCell>{SYLLABUS_PAGE.attachmentTable.view}</TableHeaderCell>
                  <TableHeaderCell>{SYLLABUS_PAGE.attachmentTable.remove}</TableHeaderCell>
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
                          ) : <span className="text-muted-foreground text-xs">—</span>}
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
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell>
                          {att.status === 'done' && att.url ? (
                            <a href={att.url} target="_blank" rel="noreferrer">
                              <Button type="button" variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
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
            <Button type="button" variant="outline" onClick={handleBack}>{SYLLABUS_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{SYLLABUS_PAGE.form.update}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
