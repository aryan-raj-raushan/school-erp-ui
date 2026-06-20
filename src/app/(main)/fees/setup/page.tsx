'use client';

import { cn } from '@/lib/utils';
import { Plus, Trash2, Pencil, Save, ChevronDown, ChevronRight, Search, GripVertical, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button, Badge, Spinner, Icon, P, FormField, Input, Select, FormCard, SectionCard,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
} from '@/components/ui';
import { Tabs } from '@/components/ui/tabs';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
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
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Frequency</TableHeaderCell>
                  <TableHeaderCell>Applicable Months</TableHeaderCell>
                  <TableHeaderCell>Income Head</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {types.length === 0
                  ? <TableEmptyRow colSpan={6}>No fee types found. Click "Add Fee Type" to create one.</TableEmptyRow>
                  : types.map(t => (
                    <TableRow key={t.id}>
                      <TableCell primary>{t.name}</TableCell>
                      <TableCell>{t.frequency}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.applicable_months?.join(', ') || '—'}</TableCell>
                      <TableCell>{t.income_head_name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={t.is_active ? 'success' : 'default'}>{t.is_active ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Div type="row" gap="xs">
                          <Button size="sm" variant="ghost" onClick={() => openEditFeeType(t)}>
                            <Icon icon={Pencil} type="sm" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteFeeType(t.id)}>
                            <Icon icon={Trash2} type="sm-danger" />
                          </Button>
                        </Div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </Div>
      </Div>
    );
  };

  return (
    <Div type="col" gap="lg">
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
                <Select value={structureFilter.academic_year_id}
                  onChange={e => setStructureFilter(f => ({ ...f, academic_year_id: e.target.value }))}>
                  <option value="">Select Academic Year</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Fee Plan" required>
                <Select value={structureFilter.fee_plan_id}
                  onChange={e => { if (!feePlans.length) fetchFeePlans(); setStructureFilter(f => ({ ...f, fee_plan_id: e.target.value })); }}
                  onFocus={() => { if (!feePlans.length) fetchFeePlans(); }}>
                  <option value="">Select Fee Plan</option>
                  {feePlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Class" required>
                <Select value={structureFilter.class_id}
                  onChange={e => setStructureFilter(f => ({ ...f, class_id: e.target.value }))}>
                  <option value="">Select Class</option>
                  {(classes as any[]).map(c => (
                    <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>
                  ))}
                </Select>
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
            <Div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-10 flex flex-col items-center gap-3">
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase tracking-wide bg-muted/10">
                    <th className="px-5 py-2.5 text-left">#</th>
                    <th className="px-5 py-2.5 text-left">Fee Type</th>
                    <th className="px-5 py-2.5 text-left">Frequency</th>
                    <th className="px-5 py-2.5 text-left">Months / Schedule</th>
                    <th className="px-5 py-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {builderItems.map((item, idx) => (
                    <tr key={item.fee_type_id} className="border-b border-border/20 hover:bg-muted/10">
                      <td className="px-5 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{item.fee_type_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{item.frequency}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {item.frequency === 'Monthly' ? (item.applicable_months?.join(', ') || '—') : 'One-time'}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">
                        ₹{(parseFloat(item.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20 border-t border-border/40">
                    <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-right text-foreground">Total</td>
                    <td className="px-5 py-3 text-right font-bold text-primary">
                      ₹{builderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
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
              <div className="flex min-h-[460px]">

                {/* ── Left: palette ─────────────────────────────────── */}
                <div className="w-60 shrink-0 flex flex-col border-r border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/40">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Palette</span>
                    {availableTypes.length > 0 && (
                      <span className="text-[10px] tabular-nums text-muted-foreground/40">{availableTypes.length} available</span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
                    {availableTypes.length === 0 ? (
                      <div className="flex items-center justify-center h-full py-10">
                        <span className="text-xs text-muted-foreground/40">All types added</span>
                      </div>
                    ) : availableTypes.map(s => (
                      <div
                        key={s.fee_type_id}
                        draggable
                        onDragStart={(e: React.DragEvent) => { e.dataTransfer.effectAllowed = 'move'; setDraggingId(s.fee_type_id); }}
                        onDragEnd={() => setDraggingId(null)}
                        className={cn(
                          'fee-type-source-item flex items-start gap-2 p-2.5 rounded-lg border select-none transition-colors',
                          draggingId === s.fee_type_id
                            ? 'opacity-30 cursor-grabbing border-border/20 bg-transparent'
                            : 'border-border/40 bg-card cursor-grab hover:border-border/70 hover:bg-card hover:shadow-sm'
                        )}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-start justify-between gap-1.5 min-w-0">
                            <span className="text-[0.82rem] font-medium text-foreground truncate leading-snug">{s.fee_type_name}</span>
                            <span className="text-[0.78rem] font-semibold text-foreground/70 tabular-nums shrink-0">
                              {s.amount && parseFloat(s.amount) > 0
                                ? `₹${parseFloat(s.amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded',
                              s.frequency === 'Monthly'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-muted text-muted-foreground'
                            )}>
                              {s.frequency}
                            </span>
                            {s.frequency === 'Monthly' && s.applicable_months?.length && (
                              <span className="text-[10px] text-muted-foreground/50">
                                {s.applicable_months.length} months
                              </span>
                            )}
                            {!s.fee_type_active && (
                              <span className="text-[10px] text-muted-foreground/40 italic">inactive</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Right: drop zone / builder ─────────────────────── */}
                <div
                  className={cn(
                    'fee-drop-zone flex-1 flex flex-col min-w-0 transition-colors',
                    dropZoneActive && 'fee-drop-zone--active bg-primary/[0.02]'
                  )}
                  onDragOver={(e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropZoneActive(true); }}
                  onDragLeave={(e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropZoneActive(false); }}
                  onDrop={handleDrop}
                >
                  {builderItems.length === 0 ? (
                    <div className={cn(
                      'fee-drop-empty flex flex-col items-center justify-center flex-1 m-5 rounded-xl border-2 border-dashed transition-colors gap-1',
                      dropZoneActive ? 'border-primary/50 bg-primary/[0.03]' : 'border-border/25'
                    )}>
                      <span className={cn('text-sm font-medium transition-colors', dropZoneActive ? 'text-primary' : 'text-muted-foreground/30')}>
                        {dropZoneActive ? 'Release to add' : 'Drag fee types here'}
                      </span>
                      {!dropZoneActive && (
                        <span className="text-xs text-muted-foreground/25">from the palette on the left</span>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* column headers */}
                      <div className="grid grid-cols-[2.5rem_1fr_9rem_8.5rem_2.5rem] items-center gap-x-3 px-5 pt-4 pb-2.5 border-b border-border/40">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-center">#</span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Fee Type</span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Schedule</span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-right">Amount (₹)</span>
                        <span />
                      </div>

                      {/* rows */}
                      <div className="flex-1 divide-y divide-border/20 overflow-y-auto">
                        {builderItems.map((item, idx) => (
                          <div
                            key={item.fee_type_id}
                            className="fee-structure-row group grid grid-cols-[2.5rem_1fr_9rem_8.5rem_2.5rem] items-center gap-x-3 px-5 py-3"
                          >
                            <span className="text-[11px] text-muted-foreground/35 font-medium text-center tabular-nums">{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="text-[0.83rem] font-medium text-foreground truncate leading-snug">{item.fee_type_name}</p>
                              <p className="text-[0.75rem] text-muted-foreground/50 leading-snug">
                                {item.frequency === 'Monthly'
                                  ? (item.applicable_months?.length ? item.applicable_months.join(', ') : 'Monthly')
                                  : 'One-time payment'}
                              </p>
                            </div>
                            <div>
                              <span className={cn(
                                'text-[10px] font-medium px-2 py-1 rounded',
                                item.frequency === 'Monthly'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'bg-muted text-muted-foreground'
                              )}>
                                {item.frequency === 'Monthly'
                                  ? `Monthly · ${item.applicable_months?.length ?? 0} mo`
                                  : 'One-time'}
                              </span>
                            </div>
                            <input
                              type="number" min="0" step="0.01"
                              className="w-full rounded-md border border-border/40 bg-background px-2.5 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/40 transition-colors"
                              value={item.amount}
                              onChange={e => updateBuilderAmount(item.fee_type_id, e.target.value)}
                              placeholder="0.00"
                            />
                            <div className="flex justify-center">
                              <Button variant="ghost" size="icon-sm"
                                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                                onClick={() => removeFromBuilder(item.fee_type_id)}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {dropZoneActive && (
                        <div className="fee-drop-indicator mx-5 mb-2 flex items-center justify-center h-10 rounded-lg border border-dashed border-primary/40 bg-primary/[0.02]">
                          <span className="text-xs text-primary/60 font-medium">Release to add</span>
                        </div>
                      )}

                      {/* total */}
                      <div className="fee-structure-total flex items-center justify-between px-5 py-3.5 border-t border-border/40 bg-muted/20">
                        <span className="text-xs text-muted-foreground/50">
                          {builderItems.length} fee{builderItems.length !== 1 ? 's' : ''} configured
                        </span>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          ₹{builderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
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
              <Select value={routeFeesAcademicYear} onChange={e => setRouteFeesAcademicYear(e.target.value)}>
                <option value="">Select Year</option>
                {(academicYears as any[]).map(y => (
                  <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                ))}
              </Select>
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
              <Table>
                <TableHead><TableHeadRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Late Fee (₹)</TableHeaderCell>
                  <TableHeaderCell>Days After Due</TableHeaderCell>
                  <TableHeaderCell>Academic Year</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableHeadRow></TableHead>
                <TableBody>
                  {lateRules.length === 0
                    ? <TableEmptyRow colSpan={6}>No late rules configured yet.</TableEmptyRow>
                    : lateRules.map(r => (
                      <TableRow key={r.id}>
                        <TableCell primary>{r.name}</TableCell>
                        <TableCell>₹{parseFloat(r.late_fee_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{r.days_after_due} days</TableCell>
                        <TableCell>{(academicYears as any[]).find(y => y.id === r.academic_year_id)?.name ?? r.academic_year_id.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant={r.is_enabled ? 'success' : 'default'}>{r.is_enabled ? 'Active' : 'Disabled'}</Badge></TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => deleteLateRule(r.id)}>
                            <Icon icon={Trash2} type="sm-danger" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Div>
          )}
        </Div>
      )}

      {/* ─── Fee Type Modal ─────────────────────────────────────────────────── */}
      {showFeeTypeModal && (
        <Modal onClose={() => setShowFeeTypeModal(false)} title={feeTypeForm.id ? 'Edit Fee Type' : 'Add Fee Type'}>
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label="Name" required>
                <Input value={feeTypeForm.name}
                  onChange={e => setFeeTypeForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tuition Fee" />
              </FormField>
              <FormField label="Frequency" required>
                <Select value={feeTypeForm.frequency}
                  onChange={e => setFeeTypeForm(f => ({ ...f, frequency: e.target.value as typeof feeTypeForm.frequency }))}>
                  {FEE_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
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
                <Select value={feeTypeForm.income_head_id ?? ''}
                  onChange={e => setFeeTypeForm(f => ({ ...f, income_head_id: e.target.value || undefined }))}>
                  <option value="">None</option>
                  {incomeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </Select>
              </FormField>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowFeeTypeModal(false)}>Cancel</Button>
            <Button onClick={handleSaveFeeType} disabled={!feeTypeForm.name}>{feeTypeForm.id ? 'Update' : 'Create'}</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ─── Route Modal ────────────────────────────────────────────────────── */}
      {showRouteModal && (
        <Modal onClose={() => setShowRouteModal(false)} title="Add Transport Route">
          <ModalBody>
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
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowRouteModal(false)}>Cancel</Button>
            <Button onClick={handleSaveRoute} disabled={!routeForm.name}>Create</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ─── Late Rule Modal ────────────────────────────────────────────────── */}
      {showLateRuleModal && (
        <Modal onClose={() => setShowLateRuleModal(false)} title="Add Late Payment Rule">
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label="Rule Name" required>
                <Input value={lateRuleForm.name}
                  onChange={e => setLateRuleForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Monthly Late Fee" />
              </FormField>
              <FormField label="Academic Year" required>
                <Select value={lateRuleForm.academic_year_id}
                  onChange={e => setLateRuleForm(f => ({ ...f, academic_year_id: e.target.value }))}>
                  <option value="">Select Year</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </Select>
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
                <Select value={lateRuleForm.late_fine_fee_type_id}
                  onChange={e => setLateRuleForm(f => ({ ...f, late_fine_fee_type_id: e.target.value }))}>
                  <option value="">Select fee type for late fine</option>
                  {classFeeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </FormField>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowLateRuleModal(false)}>Cancel</Button>
            <Button onClick={handleSaveLateRule} disabled={!lateRuleForm.name || !lateRuleForm.academic_year_id}>Create</Button>
          </ModalFooter>
        </Modal>
      )}
    </Div>
  );
}
