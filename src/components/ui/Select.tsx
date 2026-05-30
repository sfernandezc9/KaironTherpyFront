import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...rest
}: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {rest.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        {...rest}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-slate-900
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}
          disabled:bg-slate-50 disabled:text-slate-500
          ${className}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
