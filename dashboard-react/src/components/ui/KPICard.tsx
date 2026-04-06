import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from './card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: { value: number; isPositive: boolean };
}

export function KPICard({ title, value, subtitle, subtitleColor, icon: Icon, iconBgColor = 'bg-blue-100', iconColor = 'text-blue-600', trend }: KPICardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBgColor)}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
        {(subtitle || trend) && (
          <p className={cn('text-xs mt-1', subtitleColor || 'text-muted-foreground')}>
            {trend && (
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              </span>
            )}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
