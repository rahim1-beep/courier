import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  color: string; // Tailwind color class like 'text-blue-500'
  bgColor: string; // Tailwind bg class like 'bg-blue-500/20'
  gradientFrom?: string; // Hex for gradient
  gradientTo?: string; // Hex for gradient
  isCurrency?: boolean;
  sparklineData?: any[];
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  gradientFrom = '#3B82F6',
  gradientTo = '#0F172A',
  isCurrency = false,
  sparklineData,
  isLoading = false,
}) => {
  const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 20 });
  const displayValue = useTransform(spring, (current) => 
    isCurrency 
      ? new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(current)
      : Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    if (!isLoading) {
      spring.set(value);
    }
  }, [value, isLoading, spring]);

  if (isLoading) {
    return (
      <GlassCard className="relative overflow-hidden h-36">
        <div className="animate-pulse flex flex-col justify-between h-full space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
            <div className="h-10 w-10 bg-slate-700/50 rounded-full"></div>
          </div>
          <div className="h-8 bg-slate-700/50 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700/50 rounded w-1/3"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover className="relative overflow-hidden group flex flex-col justify-between h-36 border-t-0 p-5 rounded-xl">
      {/* Top Gradient Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px] opacity-100"
        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
      />
      
      <div className="flex justify-between items-start z-10 pt-1">
        <p className="text-[13px] font-medium text-secondary">{title}</p>
        <div className={cn('p-2 rounded-full', bgColor)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
      </div>
      
      <div className="z-10 mt-2">
        <motion.h3 className="text-[28px] font-bold font-mono tracking-tight text-primary leading-none">
          {displayValue}
        </motion.h3>
        <p className="text-[12px] font-medium text-muted mt-2">{subtitle}</p>
      </div>

      {sparklineData && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={gradientTo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={gradientFrom} 
                fill={`url(#gradient-${title})`} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
};
