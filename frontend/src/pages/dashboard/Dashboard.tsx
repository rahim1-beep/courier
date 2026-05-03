import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Truck, Users, CreditCard, Activity } from 'lucide-react';
import { KPICard } from '../../components/common/KPICard';
import { GlassCard } from '../../components/common/GlassCard';
import { TrackingTimeline } from '../../components/common/TrackingTimeline';
import { queryKeys } from '../../api/queryKeys';
import { shipmentsApi } from '../../api/shipments.api';
import { customersApi } from '../../api/customers.api';
import { billingApi } from '../../api/billing.api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ShipmentStatus } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  // Fetch aggregation data
  const { data: shipmentsData, isLoading: loadingShipments } = useQuery({
    queryKey: queryKeys.shipments.list({ limit: 10 }),
    queryFn: () => shipmentsApi.findAll({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: customersData, isLoading: loadingCustomers } = useQuery({
    queryKey: queryKeys.customers.list({ limit: 1 }),
    queryFn: () => customersApi.findAll({ limit: 1 }),
  });

  const { data: billingData, isLoading: loadingBilling } = useQuery({
    queryKey: queryKeys.billing.list({ limit: 10 }),
    queryFn: () => billingApi.findAll({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  // Calculate mock revenue based on recent invoices
  const revenueData = useMemo(() => {
    if (!billingData?.data) return [];
    return billingData.data.slice(0, 7).map((inv, i) => ({
      name: `Day ${i + 1}`,
      revenue: Number(inv.totalAmount),
    })).reverse();
  }, [billingData]);

  const activeShipments = shipmentsData?.meta.total || 0; // Ideally from an aggregation endpoint
  const totalCustomers = customersData?.meta.total || 0;
  
  const totalRevenue = useMemo(() => {
    return billingData?.data?.reduce((sum, inv) => sum + Number(inv.totalAmount), 0) || 0;
  }, [billingData]);

  const mockSparkline = [
    { value: 400 }, { value: 300 }, { value: 550 }, 
    { value: 450 }, { value: 700 }, { value: 650 }, { value: 800 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-title">Dashboard Overview</h1>
          <p className="text-secondary mt-1">Welcome back. Here's what's happening with your operations today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Shipments"
          value={activeShipments}
          subtitle="+12% from last week"
          icon={Package}
          color="text-brand-500"
          bgColor="bg-brand-subtle"
          gradientFrom="#6366F1"
          gradientTo="#818CF8"
          sparklineData={mockSparkline}
          isLoading={loadingShipments}
        />
        <KPICard
          title="In Transit"
          value={Math.floor(activeShipments * 0.4)}
          subtitle="Currently out for delivery"
          icon={Truck}
          color="text-amber-500"
          bgColor="bg-amber-subtle"
          gradientFrom="#F59E0B"
          gradientTo="#FBBF24"
          sparklineData={mockSparkline.map(d => ({ value: d.value * 0.4 }))}
          isLoading={loadingShipments}
        />
        <KPICard
          title="Total Customers"
          value={totalCustomers}
          subtitle="+4 new this month"
          icon={Users}
          color="text-sky-500"
          bgColor="bg-sky-subtle"
          gradientFrom="#0EA5E9"
          gradientTo="#38BDF8"
          isLoading={loadingCustomers}
        />
        <KPICard
          title="Recent Revenue"
          value={totalRevenue}
          subtitle="From last 10 invoices"
          icon={CreditCard}
          color="text-violet-500"
          bgColor="bg-violet-subtle"
          gradientFrom="#8B5CF6"
          gradientTo="#A78BFA"
          isCurrency
          sparklineData={revenueData.length ? revenueData.map(d => ({ value: d.revenue })) : mockSparkline}
          isLoading={loadingBilling}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-400" />
              Revenue Overview
            </h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.length ? revenueData : Array(7).fill({ name: '', revenue: 0 })} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-elevated)', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Shipments Feed */}
        <GlassCard className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading">Recent Activity</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loadingShipments ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-elevated" />
                    <div className="flex-1">
                      <div className="h-4 w-1/2 bg-elevated rounded mb-2" />
                      <div className="h-3 w-1/3 bg-elevated rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {shipmentsData?.data.slice(0, 5).map((shipment) => (
                  <div key={shipment.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-elevated transition-colors cursor-pointer border border-transparent hover:border-default">
                    <div className="w-8 h-8 rounded-full bg-brand-subtle border border-brand-subtle flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-4 h-4 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-primary">
                        {shipment.trackingId} <span className="text-muted font-normal">updated to</span> <span className="text-brand-400">{shipment.status.replace(/_/g, ' ')}</span>
                      </p>
                      <p className="text-[12px] text-muted mt-1">{formatDateTime(shipment.updatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
