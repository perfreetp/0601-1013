import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatNumber } from '@/utils/format';

type StatCardVariant = 'primary' | 'accent' | 'success' | 'warning';

interface StatCardProps {
  title: ReactNode;
  value: number;
  trend?: number;
  trendLabel?: string;
  data?: number[];
  variant?: StatCardVariant;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const variantConfig: Record<
  StatCardVariant,
  {
    gradient: string;
    glow: string;
    trendUp: string;
    trendDown: string;
    line: string;
    area: string;
  }
> = {
  primary: {
    gradient: 'from-primary-600 via-primary-500 to-primary-400',
    glow: 'from-primary-500/30 to-primary-400/0',
    trendUp: 'text-success-600 bg-success-50',
    trendDown: 'text-danger-600 bg-danger-50',
    line: '#6366F1',
    area: 'url(#primaryGradient)',
  },
  accent: {
    gradient: 'from-accent-600 via-accent-500 to-accent-400',
    glow: 'from-accent-500/30 to-accent-400/0',
    trendUp: 'text-success-600 bg-success-50',
    trendDown: 'text-danger-600 bg-danger-50',
    line: '#F97316',
    area: 'url(#accentGradient)',
  },
  success: {
    gradient: 'from-success-600 via-success-500 to-success-400',
    glow: 'from-success-500/30 to-success-400/0',
    trendUp: 'text-success-600 bg-success-50',
    trendDown: 'text-danger-600 bg-danger-50',
    line: '#10B981',
    area: 'url(#successGradient)',
  },
  warning: {
    gradient: 'from-warning-600 via-warning-500 to-warning-400',
    glow: 'from-warning-500/30 to-warning-400/0',
    trendUp: 'text-success-600 bg-success-50',
    trendDown: 'text-danger-600 bg-danger-50',
    line: '#F59E0B',
    area: 'url(#warningGradient)',
  },
};

function generateSmoothPath(data: number[], width: number, height: number, padding: number = 4): string {
  if (data.length < 2) return '';

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y };
  });

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function generateAreaPath(data: number[], width: number, height: number, padding: number = 4): string {
  if (data.length < 2) return '';

  const linePath = generateSmoothPath(data, width, height, padding);
  const chartWidth = width - padding * 2;
  const bottomY = height - padding;

  return `${linePath} L ${padding + chartWidth} ${bottomY} L ${padding} ${bottomY} Z`;
}

export default function StatCard({
  title,
  value,
  trend,
  trendLabel,
  data,
  variant = 'primary',
  prefix = '',
  suffix = '',
  className,
}: StatCardProps) {
  const config = variantConfig[variant];
  const isPositive = (trend ?? 0) >= 0;
  const chartData = data ?? [12, 19, 14, 22, 18, 28, 24, 35, 30, 42, 38, 48];

  return (
    <div
      className={cn(
        'relative p-6 rounded-2xl bg-white shadow-card border border-neutral-100 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
        className
      )}
    >
      <div
        className={cn(
          'absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br blur-3xl opacity-60 pointer-events-none',
          config.glow
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              {prefix && <span className="text-lg font-semibold text-neutral-600">{prefix}</span>}
              <span
                className={cn(
                  'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                  config.gradient
                )}
              >
                {formatNumber(value)}
              </span>
              {suffix && <span className="text-lg font-semibold text-neutral-600">{suffix}</span>}
            </div>
          </div>

          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                isPositive ? config.trendUp : config.trendDown
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
              {trendLabel && <span className="text-neutral-400 ml-0.5">{trendLabel}</span>}
            </div>
          )}
        </div>

        <div className="w-full h-16 -mx-2">
          <svg
            viewBox={`0 0 200 64`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="accentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="successGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="warningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d={generateAreaPath(chartData, 200, 64, 8)}
              fill={config.area}
            />

            <path
              d={generateSmoothPath(chartData, 200, 64, 8)}
              fill="none"
              stroke={config.line}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {chartData.length > 0 && (() => {
              const lastIndex = chartData.length - 1;
              const padding = 8;
              const chartWidth = 200 - padding * 2;
              const chartHeight = 64 - padding * 2;
              const minVal = Math.min(...chartData);
              const maxVal = Math.max(...chartData);
              const range = maxVal - minVal || 1;
              const x = padding + (lastIndex / (chartData.length - 1)) * chartWidth;
              const y = padding + chartHeight - ((chartData[lastIndex] - minVal) / range) * chartHeight;
              return (
                <>
                  <circle cx={x} cy={y} r="5" fill={config.line} fillOpacity="0.2" />
                  <circle cx={x} cy={y} r="3" fill={config.line} />
                </>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}
