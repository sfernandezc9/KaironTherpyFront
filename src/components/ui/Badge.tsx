interface BadgeProps {
  label: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'slate' | 'teal';
  dot?: boolean;
}

const colors = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  teal: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
};

const dotColors = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  slate: 'bg-slate-400',
  teal: 'bg-primary-600',
};

export default function Badge({ label, color = 'slate', dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[color]}`} />}
      {label}
    </span>
  );
}

export function StockBajoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
      <span className="text-base leading-none">⚠</span>
      Stock bajo
    </span>
  );
}
