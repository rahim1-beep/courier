import React from 'react';
import { Package, Truck, CheckCircle, ArrowUpCircle, MapPin, AlertCircle, XCircle } from 'lucide-react';
import { ShipmentStatus, ShipmentStatusLog } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface TrackingTimelineProps {
  logs: ShipmentStatusLog[];
  currentStatus: ShipmentStatus;
}

const getIcon = (status: ShipmentStatus) => {
  switch (status) {
    case ShipmentStatus.CREATED: return Package;
    case ShipmentStatus.PICKED_UP: return ArrowUpCircle;
    case ShipmentStatus.IN_TRANSIT: return Truck;
    case ShipmentStatus.OUT_FOR_DELIVERY: return MapPin;
    case ShipmentStatus.DELIVERED: return CheckCircle;
    case ShipmentStatus.ON_HOLD: return AlertCircle;
    case ShipmentStatus.RETURNED: return XCircle;
    case ShipmentStatus.CANCELLED: return XCircle;
    default: return Package;
  }
};

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ logs, currentStatus }) => {
  // Map logs to an array where we can render them
  // A real implementation would merge the predefined flow with the actual logs
  
  const isTerminal = ['DELIVERED', 'RETURNED', 'CANCELLED'].includes(currentStatus as string);
  const isOnHold = currentStatus === ShipmentStatus.ON_HOLD;

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
      {logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((log, index) => {
        const Icon = getIcon(log.status);
        const isCurrent = index === logs.length - 1;
        const isPast = index < logs.length - 1;
        
        let colorClass = 'text-slate-500 bg-slate-800';
        let glowClass = '';
        
        if (isCurrent) {
          if (log.status === ShipmentStatus.DELIVERED) {
            colorClass = 'text-green-500 bg-green-500/10 border-green-500/30';
            glowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
          } else if (log.status === ShipmentStatus.CANCELLED || log.status === ShipmentStatus.RETURNED) {
            colorClass = 'text-red-500 bg-red-500/10 border-red-500/30';
            glowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
          } else if (log.status === ShipmentStatus.ON_HOLD) {
            colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
            glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.5)]';
          } else {
            colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            glowClass = 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
          }
        } else if (isPast) {
          colorClass = 'text-blue-500 bg-slate-800 border-blue-500/30';
        }

        return (
          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 bg-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
              colorClass,
              glowClass,
              isCurrent && !isTerminal && !isOnHold && "animate-pulse"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-100">{log.status.replace(/_/g, ' ')}</h4>
                <span className="text-xs text-slate-400 font-mono">{formatDateTime(log.timestamp)}</span>
              </div>
              {log.note && (
                <p className="text-sm text-slate-400">{log.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
