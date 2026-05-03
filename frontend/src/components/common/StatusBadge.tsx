import React from 'react';
import { cn } from '../../utils/cn';
import { STATUS_COLORS } from '../../utils/constants';
import { ShipmentStatus, InvoiceStatus, AttendanceStatus } from '../../types';

interface StatusBadgeProps {
  status: ShipmentStatus | InvoiceStatus | AttendanceStatus | string;
  className?: string;
  showDot?: boolean;
}

const BADGE_STYLES: Record<string, string> = {
  // Shipments
  CREATED: 'bg-sky-subtle text-sky-400',
  PICKED_UP: 'bg-brand-subtle text-brand-400',
  IN_TRANSIT: 'bg-accent-subtle text-accent-400',
  OUT_FOR_DELIVERY: 'bg-amber-subtle text-amber-400',
  DELIVERED: 'bg-accent-subtle text-accent-500',
  ON_HOLD: 'bg-amber-subtle text-amber-500',
  RETURNED: 'bg-rose-subtle text-rose-400',
  CANCELLED: 'bg-[rgba(0,0,0,0.15)] text-muted',
  
  // Invoices
  PAID: 'bg-accent-subtle text-accent-500',
  PARTIALLY_PAID: 'bg-amber-subtle text-amber-500',
  ISSUED: 'bg-sky-subtle text-sky-400',
  DRAFT: 'bg-[rgba(0,0,0,0.15)] text-muted',
  VOID: 'bg-rose-subtle text-rose-400 line-through',
  
  // Default fallback
  DEFAULT: 'bg-elevated text-secondary',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showDot = true }) => {
  const badgeClass = BADGE_STYLES[status as string] || BADGE_STYLES.DEFAULT;
  const isAnimated = status === 'IN_TRANSIT' || status === 'ON_HOLD';

  return (
    <span className={cn(
      'v2-badge',
      badgeClass,
      className
    )}>
      {showDot && status !== 'VOID' && status !== 'CANCELLED' && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-current',
          isAnimated && 'animate-pulse'
        )} />
      )}
      {status.replace(/_/g, ' ')}
    </span>
  );
};
