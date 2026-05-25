'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SCHOOLS_PAGE } from '@/constants';
import { useSchools } from '@/hooks/useSchools';
import { CreateSchoolModal } from '@/components/schools/CreateSchoolModal';
import type { CreateSchoolPayload } from '@/services/schools.service';

export default function SchoolsPage() {
  const { schools, pagination, isLoading, isCreating, createSchool } = useSchools();
  const [showModal, setShowModal] = useState(false);

  async function handleCreate(payload: CreateSchoolPayload) {
    await createSchool(payload);
    setShowModal(false);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {SCHOOLS_PAGE.title}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">{SCHOOLS_PAGE.description}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            <Plus size={16} />
            {SCHOOLS_PAGE.addButton}
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{SCHOOLS_PAGE.table.name}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{SCHOOLS_PAGE.table.code}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{SCHOOLS_PAGE.table.board}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{SCHOOLS_PAGE.table.city}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{SCHOOLS_PAGE.table.status}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{SCHOOLS_PAGE.table.created}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                    Loading…
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                    {SCHOOLS_PAGE.empty}
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr
                    key={school.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {school.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{school.code ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{school.board_type ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{school.city ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          school.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {school.is_active ? SCHOOLS_PAGE.status.active : SCHOOLS_PAGE.status.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(school.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {pagination.total} total
              </p>
              <p className="text-xs text-zinc-500">
                Page {pagination.page} / {pagination.totalPages}
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateSchoolModal
        isOpen={showModal}
        isSubmitting={isCreating}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
