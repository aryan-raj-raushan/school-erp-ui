'use client';

import { useMemo } from 'react';
import { Plus, Trash2, Pencil, Save, ChevronDown, ChevronRight, Search, GripVertical, X } from 'lucide-react';
import {
  Div, Button, Badge, Spinner, Icon, P, FormField, Input, FormCard, SectionCard,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  PageHeader, PageCol,
  ResponsiveSelect, ResponsiveModalContainer,
  DataTable, type ColumnDef, RowActions,
} from '@/components/ui';
import { Tabs } from '@/components/ui/tabs';
import { useFeesSetup } from '@/hooks/useFeesSetup';
import type { FeeType } from '@/services/fees.service';

export default function FeeSetupPage() {
  const {
    academicYears, classes, incomeHeads,
    tab, setTab,
    showFeeTypeModal, setShowFeeTypeModal,
    showRouteModal, setShowRouteModal,
    showLateRuleModal, setShowLateRuleModal,
    feeTypeForm, setFeeTypeForm,
    routeForm, setRouteForm,
    lateRuleForm, setLateRuleForm,
    builderItems, draggingId, setDraggingId,
    dropZoneActive, setDropZoneActive, structureMode, setStructureMode,
    expandedRoute,
    availableTypes, hasExistingStructure,
    selectedAcademicYearName, selectedPlanName, selectedClassName, builderTotal,
    classFeeTypes, transportFeeTypes, loadingFeeTypes,
    openAddFeeType, openEditFeeType, handleSaveFeeType,
    deleteFeeType, toggleMonth,
    feePlans, loadingPlans, toggleFeePlan,
    structureFilter, setStructureFilter,
    classStructure, loadingStructure,
    handleLoadStructure, handleSaveStructure,
    handleDrop, removeFromBuilder, updateBuilderAmount,
    transportRoutes, loadingRoutes,
    routeFees, routeFeesAcademicYear, setRouteFeesAcademicYear,
    deleteTransportRoute,
    openAddRoute, handleSaveRoute, handleRouteExpand,
    lateRules, loadingLateRules, deleteLateRule, handleSaveLateRule,
    fetchFeePlans, fetchLateRules,
    FEE_FREQUENCIES, MONTHS, FEE_SETUP_TABS,
  } = useFeesSetup();

  const feeTypeColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { primary: true },
      },
      {
        accessorKey: 'frequency',
        header: 'Frequency',
      },
      {
        accessorKey: 'applicable_months',
        header: 'Applicable Months',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.applicable_months?.join(', ') || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'income_head_name',
        header: 'Income Head',
        cell: ({ row }) => row.original.income_head_name || '—',
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => openEditFeeType(row.original),
              },
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                confirm: { description: `Are you sure you want to delete fee type "${row.original.name}"?` },
                onClick: () => deleteFeeType(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [openEditFeeType, deleteFeeType],
  );

  const lateRuleColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { primary: true },
      },
      {
        accessorKey: 'late_fee_amount',
        header: 'Late Fee (₹)',
        cell: ({ row }) =>
          `₹${parseFloat(row.original.late_fee_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      },
      {
        accessorKey: 'days_after_due',
        header: 'Days After Due',
        cell: ({ row }) => `${row.original.days_after_due} days`,
      },
      {
        accessorKey: 'academic_year_id',
        header: 'Academic Year',
        cell: ({ row }) =>
          (academicYears as any[]).find(y => y.id === row.original.academic_year_id)?.name ??
          row.original.academic_year_id.slice(0, 8),
      },
      {
        accessorKey: 'is_enabled',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? 'success' : 'default'}>
            {row.original.is_enabled ? 'Active' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                confirm: { description: `Are you sure you want to delete rule "${row.original.name}"?` },
                onClick: () => deleteLateRule(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [academicYears, deleteLateRule],
  );

  const renderFeeTypesTab = (category: 'Class' | 'Transport') => {
    const types = category === 'Class' ? classFeeTypes : transportFeeTypes;
    return (
      <Div type="col" gap="lg">
        <Div type="row" justify="end">
          <Button size="sm" onClick={() => openAddFeeType(category)}>
            <Plus className="w-4 h-4 mr-1" /> Add Fee Type
          </Button>
        </Div>
        <Div type="col" gap="sm">
          <P color="default" weight="semibold">
            {category === 'Class' ? 'Class' : 'Transport'} Fee Types ({types.length})
          </P>
          {loadingFeeTypes ? <Div className="py-8 flex justify-center"><Spinner /></Div> : (
            <DataTable
              columns={feeTypeColumns}
              data={types}
              emptyText={`No fee types found. Click "Add Fee Type" to create one.`}
            />
          )}
        </Div>
      </Div>
    );
  };

  return (
    <PageCol>
      <PageHeader title="Fee Setup" subtitle="Configure fee types, plans, class fee structures and late rules" />
      <Tabs options={FEE_SETUP_TABS} value={tab} onChange={(v) => setTab(v as typeof tab)} />

      {tab === 'class-types' && renderFeeTypesTab('Class')}
      {tab === 'transport-types' && renderFeeTypesTab('Transport')}

      {/* ─── Fee Plans ─────────────────────────────────────────────────────── */}
      {tab === 'plans' && (
        <Div type="col" gap="lg">
          <P>3 predefined fee plans per school. Toggle each active or inactive as needed.</P>
          {loadingPlans ? <Div className="py-8 flex justify-center"><Spinner /></Div> : (
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeaderCell>Plan Name</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {feePlans.length === 0
                  ? <TableEmptyRow colSpan={4}>No fee plans found.</TableEmptyRow>
                  : feePlans.map(p => (
                    <TableRow key={p.id}>
                      <TableCell primary>{p.name}</TableCell>
                      <TableCell><Badge variant="primary">{p.plan_type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{p.description || '—'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant={p.is_active ? 'success' : 'secondary'} onClick={() => toggleFeePlan(p.id, !p.is_active)}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </Div>
      )}

      {/* ─── Class Fee Structure — DnD Builder ─────────────────────────────── */}
      {tab === 'structure' && (
        <Div type="col" gap="lg">
          <FormCard title="Select Class to Configure Fee Structure">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-3">
              <FormField label="Academic Year" required>
                <ResponsiveSelect value={structureFilter.academic_year_id}
                  onChange={e => setStructureFilter(f => ({ ...f, academic_year_id: e.target.value }))}
                  customPlaceholder="Select Academic Year"
                  options={(academicYears as any[]).map(y => ({ value: y.id, label: `${y.name ?? y.year_name}${y.is_current ? ' (Current)' : ''}` }))}
                />
              </FormField>
              <FormField label="Fee Plan" required>
                <ResponsiveSelect value={structureFilter.fee_plan_id}
                  onChange={e => { if (!feePlans.length) fetchFeePlans(); setStructureFilter(f => ({ ...f, fee_plan_id: e.target.value })); }}
                  onFocus={() => { if (!feePlans.length) fetchFeePlans(); }}
                  customPlaceholder="Select Fee Plan"
                  options={feePlans.map(p => ({ value: p.id, label: p.name }))}
                />
              </FormField>
              <FormField label="Class" required>
                <ResponsiveSelect value={structureFilter.class_id}
                  onChange={e => setStructureFilter(f => ({ ...f, class_id: e.target.value }))}
                  customPlaceholder="Select Class"
                  options={(classes as any[]).map(c => ({ value: c.id, label: c.name ?? c.class_name }))}
                />
              </FormField>
            </Div>
            <Div type="row" justify="end" className="mt-4">
              <Button
                onClick={handleLoadStructure}
                disabled={!structureFilter.academic_year_id || !structureFilter.fee_plan_id || !structureFilter.class_id || loadingStructure}
              >
                {loadingStructure ? <Spinner /> : <><Search size={14} className="mr-1" />Load Structure</>}
              </Button>
            </Div>
          </FormCard>

          {loadingStructure && <Div className="py-12 flex justify-center"><Spinner /></Div>}

          {!loadingStructure && classStructure.length === 0 && structureFilter.class_id && (
            <Div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No class fee types found. Add fee types in the "Fee Types" tab first, then load here.
            </Div>
          )}

          {!loadingStructure && classStructure.length > 0 && structureMode === 'idle' && (
            <Div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-10 type-col gap-3" type="col" align="center" gap="lg">
              <Div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </Div>
              <Div className="text-center">
                <P color="default" weight="medium">
                  No fee structure for {selectedClassName || 'this class'} yet
                </P>
                <P size="xs" className="mt-1">
                  {selectedAcademicYearName && selectedPlanName
                    ? `${selectedAcademicYearName} · ${selectedPlanName} Plan`
                    : 'Select year and plan above'}
                </P>
              </Div>
              <Button size="sm" onClick={() => setStructureMode('edit')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Structure
              </Button>
            </Div>
          )}

          {!loadingStructure && classStructure.length > 0 && structureMode === 'view' && (
            <SectionCard
              title={`${selectedClassName} — Current Fee Structure`}
              subtitle={`${selectedAcademicYearName} · ${selectedPlanName} Plan · ${builderItems.length} fee${builderItems.length !== 1 ? 's' : ''} · ₹${builderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} total`}
              actions={
                <Button size="sm" variant="outline" onClick={() => setStructureMode('edit')}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Structure
                </Button>
              }
            >
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell className="text-left">#</TableHeaderCell>
                    <TableHeaderCell className="text-left">Fee Type</TableHeaderCell>
                    <TableHeaderCell className="text-left">Frequency</TableHeaderCell>
                    <TableHeaderCell className="text-left">Months / Schedule</TableHeaderCell>
                    <TableHeaderCell className="text-right">Amount (₹)</TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {builderItems.map((item, idx) => (
                    <TableRow key={item.fee_type_id}>
                      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell><P weight="semibold">{item.fee_type_name}</P></TableCell>
                      <TableCell><P color="muted">{item.frequency}</P></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.frequency === 'Monthly' ? (item.applicable_months?.join(', ') || '—') : 'One-time'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(parseFloat(item.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Div type="row" justify="between" align="center" className="px-5 py-3 border-t border-border/40 bg-muted/20">
                <P size="sm" weight="semibold">Total</P>
                <P size="sm" weight="bold" color="primary">
                  ₹{builderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </P>
              </Div>
            </SectionCard>
          )}

          {!loadingStructure && classStructure.length > 0 && structureMode === 'edit' && (
            <SectionCard
              title={`${selectedClassName} — Fee Structure Builder`}
              subtitle={`${selectedAcademicYearName} · ${selectedPlanName} Plan`}
              actions={
                <Div type="row" gap="sm">
                  {(builderItems.length > 0 || hasExistingStructure) && (
                    <Button size="sm" variant="secondary" onClick={() => setStructureMode(hasExistingStructure ? 'view' : 'idle')}>Cancel</Button>
                  )}
                  <Button size="sm" onClick={handleSaveStructure}>
                    <Save className="w-3.5 h-3.5 mr-1" /> Save Structure
                  </Button>
                </Div>
              }
            >
              <Div type="row" className="min-h-115">

                {/* ── Left: palette ─────────────────────────────────── */}
                <Div type="col" className="w-60 shrink-0 border-r border-border/50 bg-muted/30">
                  <Div type="row" align="center" justify="between" className="px-4 pt-4 pb-3 border-b border-border/40">
                    <P size="xs" weight="semibold" color="muted" className="uppercase tracking-widest">Palette</P>
                    {availableTypes.length > 0 && (
                      <P size="xs" color="muted" className="tabular-nums">{availableTypes.length} available</P>
                    )}
                  </Div>

                  <Div type="col" className="flex-1 overflow-y-auto p-3 gap-1.5">
                    {availableTypes.length === 0 ? (
                      <Div type="col" align="center" justify="center" className="h-full py-10">
                        <P size="xs" color="muted">All types added</P>
                      </Div>
                    ) : availableTypes.map(s => (
                      <Div
                        key={s.fee_type_id}
                        type="row"
                        className={draggingId === s.fee_type_id
                          ? 'fee-type-source-item gap-2 p-2.5 rounded-lg border select-none transition-colors opacity-30 cursor-grabbing border-border/20 bg-transparent'
                          : 'fee-type-source-item gap-2 p-2.5 rounded-lg border select-none transition-colors border-border/40 bg-card cursor-grab hover:border-border/70 hover:bg-card hover:shadow-sm'
                        }
                        draggable
                        onDragStart={(e: React.DragEvent) => { e.dataTransfer.effectAllowed = 'move'; setDraggingId(s.fee_type_id); }}
                        onDragEnd={() => setDraggingId(null)}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                        <Div type="col" className="flex-1 min-w-0 gap-0.5">
                          <Div type="row" justify="between" align="start" className="min-w-0 gap-1.5">
                            <P size="sm" weight="medium" className="truncate leading-snug">{s.fee_type_name}</P>
                            <P size="xs" weight="semibold" className="tabular-nums shrink-0">
                              {s.amount && parseFloat(s.amount) > 0
                                ? `₹${parseFloat(s.amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
                                : '—'}
                            </P>
                          </Div>
                          <Div type="row" className="gap-1.5">
                            <Badge variant={s.frequency === 'Monthly' ? 'default' : 'secondary'} className="text-[10px]">
                              {s.frequency}
                            </Badge>
                            {s.frequency === 'Monthly' && s.applicable_months?.length && (
                              <P size="xs" color="muted">
                                {s.applicable_months.length} months
                              </P>
                            )}
                            {!s.fee_type_active && (
                              <P size="xs" color="muted" className="italic">inactive</P>
                            )}
                          </Div>
                        </Div>
                      </Div>
                    ))}
                  </Div>
                </Div>

                {/* ── Right: drop zone / builder ─────────────────────── */}
                <Div
                  type="col"
                  className={dropZoneActive ? 'fee-drop-zone flex-1 min-w-0 transition-colors fee-drop-zone--active bg-primary/2' : 'fee-drop-zone flex-1 min-w-0 transition-colors'}
                  onDragOver={(e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropZoneActive(true); }}
                  onDragLeave={(e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropZoneActive(false); }}
                  onDrop={handleDrop}
                >
                  {builderItems.length === 0 ? (
                    <Div
                      type="col"
                      align="center"
                      justify="center"
                      className={dropZoneActive
                        ? 'fee-drop-empty flex-1 m-5 rounded-xl border-2 border-dashed transition-colors gap-1 border-primary/50 bg-primary/3'
                        : 'fee-drop-empty flex-1 m-5 rounded-xl border-2 border-dashed transition-colors gap-1 border-border/25'
                      }
                    >
                      <P size="sm" weight="medium" className={dropZoneActive ? 'transition-colors text-primary' : 'transition-colors text-muted-foreground/30'}>
                        {dropZoneActive ? 'Release to add' : 'Drag fee types here'}
                      </P>
                      {!dropZoneActive && (
                        <P size="xs" color="muted">from the palette on the left</P>
                      )}
                    </Div>
                  ) : (
                    <>
                      {/* column headers — overflow-x-auto for mobile */}
                      <Div className="overflow-x-auto">
                      <Div type="row" className="grid min-w-120 grid-cols-[2.5rem_1fr_9rem_8.5rem_2.5rem] items-center gap-x-3 px-5 pt-4 pb-2.5 border-b border-border/40">
                        <P size="xs" weight="semibold" color="muted" className="uppercase tracking-widest text-center">#</P>
                        <P size="xs" weight="semibold" color="muted" className="uppercase tracking-widest">Fee Type</P>
                        <P size="xs" weight="semibold" color="muted" className="uppercase tracking-widest">Schedule</P>
                        <P size="xs" weight="semibold" color="muted" className="uppercase tracking-widest text-right">Amount (₹)</P>
                        <Div />
                      </Div>

                      {/* rows */}
                      <Div type="col" className="flex-1 divide-y divide-border/20 overflow-y-auto">
                        {builderItems.map((item, idx) => (
                          <Div
                            key={item.fee_type_id}
                            type="row"
                            className="fee-structure-row group grid min-w-120 grid-cols-[2.5rem_1fr_9rem_8.5rem_2.5rem] items-center gap-x-3 px-5 py-3"
                          >
                            <P size="xs" weight="medium" color="muted" className="text-center tabular-nums">{idx + 1}</P>
                            <Div type="col" className="min-w-0">
                              <P size="sm" weight="medium" className="truncate leading-snug">{item.fee_type_name}</P>
                              <P size="xs" color="muted" className="leading-snug">
                                {item.frequency === 'Monthly'
                                  ? (item.applicable_months?.length ? item.applicable_months.join(', ') : 'Monthly')
                                  : 'One-time payment'}
                              </P>
                            </Div>
                            <Badge variant={item.frequency === 'Monthly' ? 'default' : 'secondary'} className="text-[10px] w-fit">
                              {item.frequency === 'Monthly'
                                ? `Monthly · ${item.applicable_months?.length ?? 0} mo`
                                : 'One-time'}
                            </Badge>
                            <Input
                              type="number" min="0" step="0.01"
                              className="text-right tabular-nums"
                              value={item.amount}
                              onChange={e => updateBuilderAmount(item.fee_type_id, e.target.value)}
                              placeholder="0.00"
                            />
                            <Div type="row" justify="center">
                              <Button variant="ghost" size="icon-sm"
                                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                                onClick={() => removeFromBuilder(item.fee_type_id)}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </Div>
                          </Div>
                        ))}
                      </Div>
                      </Div>{/* end overflow-x-auto */}

                      {dropZoneActive && (
                        <Div type="row" align="center" justify="center" className="fee-drop-indicator mx-5 mb-2 h-10 rounded-lg border border-dashed border-primary/40 bg-primary/2">
                          <P size="xs" weight="medium" className="text-primary/60">Release to add</P>
                        </Div>
                      )}

                      {/* total */}
                      <Div type="row" justify="between" align="center" className="fee-structure-total px-5 py-3.5 border-t border-border/40 bg-muted/20">
                        <P size="xs" color="muted">
                          {builderItems.length} fee{builderItems.length !== 1 ? 's' : ''} configured
                        </P>
                        <P size="sm" weight="semibold" className="tabular-nums">
                          ₹{builderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </P>
                      </Div>
                    </>
                  )}
                </Div>
              </Div>
            </SectionCard>
          )}
        </Div>
      )}

      {/* ─── Transport Routes ───────────────────────────────────────────────── */}
      {tab === 'routes' && (
        <Div type="col" gap="lg">
          <Div type="row" justify="end">
            <Button size="sm" onClick={openAddRoute}>
              <Plus className="w-4 h-4 mr-1" /> Add Route
            </Button>
          </Div>
          <FormCard title="Transport Route Configuration">
            <FormField label="Academic Year for Fees">
              <ResponsiveSelect value={routeFeesAcademicYear} onChange={e => setRouteFeesAcademicYear(e.target.value)}
                customPlaceholder="Select Year"
                options={(academicYears as any[]).map(y => ({ value: y.id, label: `${y.name ?? y.year_name}${y.is_current ? ' (Current)' : ''}` }))}
              />
            </FormField>
          </FormCard>
          {loadingRoutes ? (
            <Div className="py-8 flex justify-center"><Spinner /></Div>
          ) : transportRoutes.length === 0 ? (
            <Div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No transport routes configured yet.
            </Div>
          ) : (
            <Div type="col" gap="sm">
              <P color="default" weight="semibold">Routes ({transportRoutes.length})</P>
              <Div type="col" gap="sm">
                {transportRoutes.map(r => (
                  <Div key={r.id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <Div type="row" justify="between" align="center" className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleRouteExpand(r.id)}>
                      <Div type="row" gap="sm" align="center">
                        {expandedRoute === r.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <P color="default" weight="medium">{r.name}</P>
                        {r.description && <P size="xs">{r.description}</P>}
                      </Div>
                      <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); deleteTransportRoute(r.id); }}>
                        <Icon icon={Trash2} type="sm-danger" />
                      </Button>
                    </Div>
                    {expandedRoute === r.id && (
                      <Div className="border-t border-border/50 p-4">
                        {!routeFeesAcademicYear ? (
                          <P>Select an academic year above to view route fees.</P>
                        ) : routeFees.length === 0 ? (
                          <P>No transport fee types configured yet.</P>
                        ) : (
                          <Table>
                            <TableHead><TableHeadRow>
                              <TableHeaderCell>Fee Type</TableHeaderCell>
                              <TableHeaderCell>Frequency</TableHeaderCell>
                              <TableHeaderCell>Amount (₹)</TableHeaderCell>
                            </TableHeadRow></TableHead>
                            <TableBody>
                              {routeFees.map(f => (
                                <TableRow key={f.fee_type_id}>
                                  <TableCell primary>{f.fee_type_name}</TableCell>
                                  <TableCell>{f.frequency}</TableCell>
                                  <TableCell>₹{parseFloat(f.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </Div>
                    )}
                  </Div>
                ))}
              </Div>
            </Div>
          )}
        </Div>
      )}

      {/* ─── Late Payment Rules ─────────────────────────────────────────────── */}
      {tab === 'late-rules' && (
        <Div type="col" gap="lg">
          <Div type="row" justify="end">
            <Button size="sm" onClick={() => setShowLateRuleModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Rule
            </Button>
          </Div>
          {loadingLateRules ? (
            <Div className="py-8 flex justify-center"><Spinner /></Div>
          ) : (
            <Div type="col" gap="sm">
              <P color="default" weight="semibold">Late Payment Rules ({lateRules.length})</P>
              <DataTable
                columns={lateRuleColumns}
                data={lateRules}
                isLoading={loadingLateRules}
                emptyText="No late rules configured yet."
              />
            </Div>
          )}
        </Div>
      )}

      {/* ─── Fee Type Modal ─────────────────────────────────────────────────── */}
      <ResponsiveModalContainer isOpen={showFeeTypeModal} onClose={() => setShowFeeTypeModal(false)} title={feeTypeForm.id ? 'Edit Fee Type' : 'Add Fee Type'}>
        <div className="px-4 py-4">
          <Div type="col" gap="md">
            <FormField label="Name" required>
              <Input value={feeTypeForm.name}
                onChange={e => setFeeTypeForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Tuition Fee" />
            </FormField>
            <FormField label="Frequency" required>
              <ResponsiveSelect value={feeTypeForm.frequency}
                onChange={e => setFeeTypeForm(f => ({ ...f, frequency: e.target.value as typeof feeTypeForm.frequency }))}
                options={FEE_FREQUENCIES.map(f => ({ value: f, label: f }))}
              />
            </FormField>
            {feeTypeForm.frequency === 'Monthly' && (
              <FormField label="Applicable Months">
                <Div type="row" className="flex-wrap gap-2 mt-1">
                  {MONTHS.map(m => (
                    <Button key={m} variant={feeTypeForm.applicable_months?.includes(m) ? 'default' : 'outline'} size="sm"
                      onClick={() => toggleMonth(m)}>
                      {m}
                    </Button>
                  ))}
                </Div>
              </FormField>
            )}
            <FormField label="Income Head (optional)">
              <ResponsiveSelect value={feeTypeForm.income_head_id ?? ''}
                onChange={e => setFeeTypeForm(f => ({ ...f, income_head_id: e.target.value || undefined }))}
                customPlaceholder="None"
                options={incomeHeads.map(h => ({ value: h.id, label: h.name }))}
              />
            </FormField>
          </Div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="secondary" onClick={() => setShowFeeTypeModal(false)}>Cancel</Button>
          <Button onClick={handleSaveFeeType} disabled={!feeTypeForm.name}>{feeTypeForm.id ? 'Update' : 'Create'}</Button>
        </div>
      </ResponsiveModalContainer>

      {/* ─── Route Modal ────────────────────────────────────────────────────── */}
      <ResponsiveModalContainer isOpen={showRouteModal} onClose={() => setShowRouteModal(false)} title="Add Transport Route">
        <div className="px-4 py-4">
          <Div type="col" gap="md">
            <FormField label="Route Name" required>
              <Input value={routeForm.name}
                onChange={e => setRouteForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. North Zone" />
            </FormField>
            <FormField label="Description">
              <Input value={routeForm.description ?? ''}
                onChange={e => setRouteForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional" />
            </FormField>
          </Div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="secondary" onClick={() => setShowRouteModal(false)}>Cancel</Button>
          <Button onClick={handleSaveRoute} disabled={!routeForm.name}>Create</Button>
        </div>
      </ResponsiveModalContainer>

      {/* ─── Late Rule Modal ────────────────────────────────────────────────── */}
      <ResponsiveModalContainer isOpen={showLateRuleModal} onClose={() => setShowLateRuleModal(false)} title="Add Late Payment Rule">
        <div className="px-4 py-4">
          <Div type="col" gap="md">
            <FormField label="Rule Name" required>
              <Input value={lateRuleForm.name}
                onChange={e => setLateRuleForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Monthly Late Fee" />
            </FormField>
            <FormField label="Academic Year" required>
              <ResponsiveSelect value={lateRuleForm.academic_year_id}
                onChange={e => setLateRuleForm(f => ({ ...f, academic_year_id: e.target.value }))}
                customPlaceholder="Select Year"
                options={(academicYears as any[]).map(y => ({ value: y.id, label: `${y.name ?? y.year_name}${y.is_current ? ' (Current)' : ''}` }))}
              />
            </FormField>
            <Div type="grid" cols={2} gap="md">
              <FormField label="Late Fee Amount (₹)" required>
                <Input type="number" value={lateRuleForm.late_fee_amount}
                  onChange={e => setLateRuleForm(f => ({ ...f, late_fee_amount: e.target.value }))}
                  placeholder="e.g. 50" />
              </FormField>
              <FormField label="Days After Due Date" required>
                <Input type="number" value={lateRuleForm.days_after_due}
                  onChange={e => setLateRuleForm(f => ({ ...f, days_after_due: e.target.value }))}
                  placeholder="e.g. 5" />
              </FormField>
            </Div>
            <FormField label="Late Fine Fee Type">
              <ResponsiveSelect value={lateRuleForm.late_fine_fee_type_id}
                onChange={e => setLateRuleForm(f => ({ ...f, late_fine_fee_type_id: e.target.value }))}
                customPlaceholder="Select fee type for late fine"
                options={classFeeTypes.map(t => ({ value: t.id, label: t.name }))}
              />
            </FormField>
          </Div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="secondary" onClick={() => setShowLateRuleModal(false)}>Cancel</Button>
          <Button onClick={handleSaveLateRule} disabled={!lateRuleForm.name || !lateRuleForm.academic_year_id}>Create</Button>
        </div>
      </ResponsiveModalContainer>
    </PageCol>
  );
}
