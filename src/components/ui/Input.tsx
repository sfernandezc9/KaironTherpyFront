import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {rest.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}
          disabled:bg-slate-50 disabled:text-slate-500
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', id, ...rest }: TextAreaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {rest.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        {...rest}
        rows={rest.rows ?? 3}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
