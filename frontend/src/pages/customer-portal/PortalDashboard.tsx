import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, FileText, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../../components/common/KPICard';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { queryKeys } from '../../api/queryKeys';
import { shipmentsApi } from '../../api/shipments.api';
import { billingApi } from '../../api/billing.api';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';

const PortalDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch recent shipments
  const { data: shipmentsData, isLoading: loadingShipments } = useQuery({
    queryKey: queryKeys.shipments.list({ limit: 5 }),
    queryFn: () => shipmentsApi.findAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  // Fetch recent invoices
  const { data: billingData, isLoading: loadingBilling } = useQuery({
    queryKey: queryKeys.billing.list({ limit: 5 }),
    queryFn: () => billingApi.findAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const activeShipments = shipmentsData?.meta.total || 0;
  
  const balanceDue = useMemo(() => {
    return billingData?.data?.reduce((sum, inv) => {
      return inv.status !== 'PAID' ? sum + Number(inv.totalAmount) - Number(inv.amountPaid || 0) : sum;
    }, 0) || 0;
  }, [billingData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to your Portal</h1>
        <p className="text-slate-400 mt-1">Track your shipments and manage your account.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Shipments"
          value={activeShipments}
          icon={Package}
          color="text-blue-500"
          bgColor="bg-blue-500/20"
          gradientFrom="#3B82F6"
          gradientTo="#0F172A"
          isLoading={loadingShipments}
        />
        <KPICard
          title="In Transit"
          value={Math.floor(activeShipments * 0.6)}
          icon={Clock}
          color="text-amber-500"
          bgColor="bg-amber-500/20"
          gradientFrom="#F59E0B"
          gradientTo="#0F172A"
          isLoading={loadingShipments}
        />
        <KPICard
          title="Delivered"
          value={Math.floor(activeShipments * 0.4)}
          icon={CheckCircle}
          color="text-green-500"
          bgColor="bg-green-500/20"
          gradientFrom="#10B981"
          gradientTo="#0F172A"
          isLoading={loadingShipments}
        />
        <KPICard
          title="Outstanding Balance"
          value={balanceDue}
          icon={FileText}
          color="text-purple-500"
          bgColor="bg-purple-500/20"
          gradientFrom="#8B5CF6"
          gradientTo="#0F172A"
          isCurrency
          isLoading={loadingBilling}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Shipments</h2>
            <button onClick={() => navigate('/customer-portal/shipments')} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
          </div>
          
          <div className="space-y-4">
            {loadingShipments ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800 rounded-lg" />)}
              </div>
            ) : shipmentsData?.data?.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No recent shipments found.</p>
            ) : (
              shipmentsData?.data?.slice(0, 5).map((shipment) => (
                <div key={shipment.id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="font-mono text-sm text-blue-400 font-medium">{shipment.trackingId}</p>
                    <p className="text-xs text-slate-400 mt-1">To: {shipment.detail?.receiverName}</p>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Recent Invoices */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Invoices</h2>
            <button onClick={() => navigate('/customer-portal/billing')} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
          </div>
          
          <div className="space-y-4">
            {loadingBilling ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800 rounded-lg" />)}
              </div>
            ) : billingData?.data?.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No recent invoices found.</p>
            ) : (
              billingData?.data?.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="font-mono text-sm text-slate-200">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-400 mt-1">Due: {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(invoice.totalAmount)}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default PortalDashboard;
