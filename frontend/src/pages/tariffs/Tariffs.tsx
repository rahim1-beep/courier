import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tags, Plus } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { queryKeys } from '../../api/queryKeys';
import { tariffsApi } from '../../api/tariffs.api';
import { formatCurrency } from '../../utils/formatters';
import { CreateTariffDrawer } from './CreateTariffDrawer';
import { CreateServiceDrawer } from './CreateServiceDrawer';

const Tariffs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isTariffDrawerOpen, setIsTariffDrawerOpen] = useState(false);
  const [isServiceDrawerOpen, setIsServiceDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tariffs.list({ page, limit: 10 }),
    queryFn: () => tariffsApi.findAllTariffs({ page, limit: 10 }),
  });

  const columns = [
    {
      accessorKey: 'service.name',
      header: 'Service',
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{info.getValue() || 'Standard'}</span>
          <span className="text-[10px] text-muted font-mono uppercase tracking-tight">{info.row.original.service?.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'countryName',
      header: 'Destination',
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{info.row.original.countryName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-canvas text-muted border border-default uppercase tracking-wider">{info.row.original.countryCode}</span>
        </div>
      )
    },
    {
      accessorKey: 'basePrice',
      header: 'Base Price',
      cell: (info: any) => <span className="font-mono text-primary">{formatCurrency(Number(info.getValue()))}</span>,
    },
    {
      accessorKey: 'pricePerKg',
      header: 'Per Kg',
      cell: (info: any) => <span className="font-mono text-primary">{formatCurrency(Number(info.getValue()))}</span>,
    },
    {
      accessorKey: 'minWeight',
      header: 'Weight Tier (Kg)',
      cell: (info: any) => (
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-elevated border border-subtle text-[11px] font-mono text-secondary">
            {info.getValue()}
          </span>
          <span className="text-muted">→</span>
          <span className="px-1.5 py-0.5 rounded bg-elevated border border-subtle text-[11px] font-mono text-secondary">
            {info.row.original.maxWeight || '∞'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title">Pricing Matrix</h1>
          <p className="text-secondary mt-1">Configure weight-based tiers and service-level surcharges.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsServiceDrawerOpen(true)}
            className="flex items-center v2-btn-ghost text-sm"
          >
            <Tags className="w-4 h-4 mr-2 shrink-0" />
            Manage Services
          </button>
          <button 
            onClick={() => setIsTariffDrawerOpen(true)}
            className="flex items-center v2-btn-primary"
          >
            <Plus className="w-4 h-4 mr-2 shrink-0" />
            Add Tariff Tier
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={Array.isArray(data) ? data : (data as any)?.data || []}
        isLoading={isLoading}
        page={page}
        total={Array.isArray(data) ? data.length : (data as any)?.meta?.total || 0}
        pageCount={Array.isArray(data) ? 1 : (data as any)?.meta?.totalPages || 1}
        onPageChange={setPage}
        emptyTitle="No pricing rules found"
        emptyDescription="Add service tiers to configure your pricing matrix."
      />

      <CreateServiceDrawer
        isOpen={isServiceDrawerOpen}
        onClose={() => setIsServiceDrawerOpen(false)}
      />

      <CreateTariffDrawer 
        isOpen={isTariffDrawerOpen} 
        onClose={() => setIsTariffDrawerOpen(false)} 
      />
    </div>
  );
};

export default Tariffs;
