import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, ArrowLeft, FileText, Printer, Edit2, AlertTriangle, Box, MapPin, Truck, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';

import { GlassCard } from '../../components/common/GlassCard';
import { TrackingTimeline } from '../../components/common/TrackingTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

import { queryKeys } from '../../api/queryKeys';
import { shipmentsApi } from '../../api/shipments.api';
import { ShipmentStatus } from '../../types';
import { formatCurrency, formatDate, formatDateTime, formatWeight } from '../../utils/formatters';

const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');

  const { data: shipment, isLoading, isError } = useQuery({
    queryKey: queryKeys.shipments.detail(id!),
    queryFn: () => shipmentsApi.findOne(id!),
    enabled: !!id,
  });

  const { data: tracking } = useQuery({
    queryKey: queryKeys.shipments.tracking(id!),
    queryFn: () => shipmentsApi.getTracking(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { status: ShipmentStatus; note?: string }) => shipmentsApi.updateStatus(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.tracking(id!) });
      toast.success('Status updated successfully');
      setIsStatusModalOpen(false);
      setNewStatus('');
      setStatusNote('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-800 rounded-xl"></div>
            <div className="h-48 bg-slate-800 rounded-xl"></div>
          </div>
          <div className="h-96 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="p-12 text-center rounded-xl bg-slate-800/30 border border-slate-700">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Shipment Not Found</h2>
        <p className="text-slate-400 mb-6">The shipment you're looking for doesn't exist or you don't have access.</p>
        <button onClick={() => navigate('/shipments')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Back to Shipments
        </button>
      </div>
    );
  }

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    updateStatusMutation.mutate({ status: newStatus as ShipmentStatus, note: statusNote });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/shipments')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-mono text-white tracking-tight">{shipment.trackingId}</h1>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-slate-400 text-sm">Created on {formatDateTime(shipment.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="Print Waybill"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsStatusModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] font-medium"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Routing Info */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Routing Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="hidden md:block absolute top-6 bottom-6 left-1/2 -translate-x-px w-px bg-slate-800" />
              
              <div className="space-y-4 pr-0 md:pr-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sender</p>
                  <p className="text-base font-medium text-white">{shipment.detail?.senderName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 whitespace-pre-line">{shipment.detail?.senderAddress}</p>
                  <p className="text-sm text-slate-400 mt-1">{shipment.detail?.senderCountry}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4" /> {shipment.detail?.senderContact}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 pl-0 md:pl-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Receiver</p>
                  <p className="text-base font-medium text-white">{shipment.detail?.receiverName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 whitespace-pre-line">{shipment.detail?.receiverAddress}</p>
                  <p className="text-sm text-slate-400 mt-1">{shipment.detail?.receiverCountry}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4" /> {shipment.detail?.receiverContact}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Package Info */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Box className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Package Information</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Service</p>
                <p className="font-medium text-white">{shipment.service?.name || 'Standard'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Weight</p>
                <p className="font-medium text-white">{formatWeight(shipment.weight)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Pieces</p>
                <p className="font-medium text-white">{shipment.pieces?.length || 1}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Cost</p>
                <p className="font-medium text-white">{formatCurrency(shipment.cost)}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Truck className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Tracking History</h2>
            </div>
            
            <div className="mt-6">
              {tracking?.logs && tracking.logs.length > 0 ? (
                <TrackingTimeline logs={tracking.logs} currentStatus={shipment.status} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">No tracking history available yet.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Update Status Modal */}
      <ConfirmDialog
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleUpdateStatus}
        title="Update Shipment Status"
        description={`Changing status for ${shipment.trackingId}`}
        confirmText="Update Status"
        isDestructive={false}
        isLoading={updateStatusMutation.isPending}
      />
      
      {/* We need a custom modal for the status form since ConfirmDialog doesn't support inputs out of the box, 
          but for brevity in this scaffold we'll mock the UI interaction or rely on a simple prompt if needed.
          In a full implementation, we'd build a specific Modal component here. */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Update Status</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select status...</option>
                  {Object.values(ShipmentStatus).map(status => (
                    <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Note (Optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="E.g., Left at front desk"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatusMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Save Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetail;
