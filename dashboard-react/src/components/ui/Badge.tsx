import { Badge as ShadcnBadge } from './shadcn-badge';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  success: 'bg-green-50 text-green-700 hover:bg-green-50',
  warning: 'bg-amber-50 text-amber-700 hover:bg-amber-50',
  danger: 'bg-red-50 text-red-600 hover:bg-red-50',
  info: 'bg-blue-50 text-blue-700 hover:bg-blue-50',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <ShadcnBadge className={cn('border-transparent rounded', variantStyles[variant], sizeStyles[size])}>
      {children}
    </ShadcnBadge>
  );
}
