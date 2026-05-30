import { useState, type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => string | number | boolean | null | undefined;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
}

type SortDir = 'asc' | 'desc';

export default function Table<T>({
  columns,
  data,
  onRowClick,
  keyExtractor,
  emptyMessage = 'Sin resultados',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.accessor) return 0;
    const av = col.accessor(a);
    const bv = col.accessor(b);
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = String(av).localeCompare(String(bv), 'es-CL', { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide select-none ${
                  col.sortable ? 'cursor-pointer hover:text-primary-800' : ''
                }`}
              >
                {col.header}
                {col.sortable && sortKey === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(row) : col.accessor ? String(col.accessor(row) ?? '—') : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
