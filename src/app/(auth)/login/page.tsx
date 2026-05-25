'use client';

import { useState } from 'react';
import { AUTH_TABS } from '@/constants';
import { AuthLoginTab } from '@/types';
import { CompanyLoginForm } from '@/components/auth/CompanyLoginForm';
import { SchoolLoginForm } from '@/components/auth/SchoolLoginForm';

export default function LoginPage() {
  const [tab, setTab] = useState<AuthLoginTab>(AuthLoginTab.COMPANY);

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
        {AUTH_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === value
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === AuthLoginTab.COMPANY ? <CompanyLoginForm /> : <SchoolLoginForm />}
    </div>
  );
}
