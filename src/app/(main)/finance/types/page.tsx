"use client";

import { useFeeMasterTypes } from "@/hooks/useFees";
import { FEE_TYPES_PAGE } from "@/constants";
import {
  Div, H1, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Modal, FormField, Input, Spinner, Icon,
} from "@/components/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function FeeTypesPage() {
  const {
    feeTypes, isLoading, isSaving,
    showModal, setShowModal,
    editingId, form,
    openAdd, openEdit,
    handleSubmit, handleDelete,
  } = useFeeMasterTypes();

  const { register, handleSubmit: onSubmit, formState: { errors } } = form;

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <H1>{FEE_TYPES_PAGE.title}</H1>
        <Button onClick={openAdd}>
          <Icon icon={Plus} type="btn-icon" />
          {FEE_TYPES_PAGE.addButton}
        </Button>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{FEE_TYPES_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{FEE_TYPES_PAGE.table.description}</TableHeaderCell>
            <TableHeaderCell>{FEE_TYPES_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={4}><Spinner /></TableEmptyRow>
          ) : feeTypes.length === 0 ? (
            <TableEmptyRow colSpan={4}>{FEE_TYPES_PAGE.empty}</TableEmptyRow>
          ) : (
            feeTypes.map((ft, i) => (
              <TableRow key={ft.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{ft.name}</TableCell>
                <TableCell>{ft.description ?? "—"}</TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(ft)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(ft.id)}>
                      <Icon icon={Trash2} type="sm-danger" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showModal && (
        <Modal
          title={editingId ? FEE_TYPES_PAGE.form.editTitle : FEE_TYPES_PAGE.form.title}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={onSubmit(handleSubmit)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label={FEE_TYPES_PAGE.form.name} error={errors.name?.message}>
                <Input {...register("name")} placeholder="Tuition Fee" />
              </FormField>
              <FormField label={FEE_TYPES_PAGE.form.description}>
                <Input {...register("description")} placeholder="Optional description" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {FEE_TYPES_PAGE.form.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {editingId ? FEE_TYPES_PAGE.form.save : FEE_TYPES_PAGE.form.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
