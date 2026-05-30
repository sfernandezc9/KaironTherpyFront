import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'bg-primary-800 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-primary-800 hover:bg-primary-50 focus:ring-primary-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 font-medium rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-1
        transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading && <Spinner size="sm" className="!text-current" />}
      {children}
    </button>
  );
}
