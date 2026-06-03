import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  children: ReactNode;
}

export function Tabs({ tabs, active, onChange, children }: TabsProps) {
  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              active === tab.id
                ? 'text-primary-800 dark:text-primary-300 border-b-2 border-primary-800 dark:border-primary-400 -mb-px bg-white dark:bg-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  active: string;
  children: ReactNode;
}

export function TabPanel({ id, active, children }: TabPanelProps) {
  if (id !== active) return null;
  return <div>{children}</div>;
}
