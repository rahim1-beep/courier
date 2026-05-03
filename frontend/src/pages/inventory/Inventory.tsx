import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, Plus, UploadCloud } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { KPICard } from '../../components/common/KPICard';
import { queryKeys } from '../../api/queryKeys';
import { inventoryApi } from '../../api/inventory.api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Inventory: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.inventory.list({ page, limit: 10 }),
    queryFn: () => inventoryApi.findAll({ page, limit: 10 }),
  });

  const totalItems = data?.meta?.total || 0;
  const lowStock = 0; // Mock

  const columns = [
    {
      accessorKey: 'inventoryCode',
      header: 'Inventory Code',
      cell: (info: any) => <span className="font-mono text-blue-400 font-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: 'branchId',
      header: 'Branch ID',
    },
    {
      accessorKey: 'uploadedById',
      header: 'Uploaded By',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (info: any) => formatDate(info.getValue()),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inventory Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage packaging materials and office supplies.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
            <UploadCloud className="w-4 h-4 mr-2" />
            Bulk Import
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Total Items Tracked"
          value={totalItems}
          icon={Archive}
          color="text-blue-500"
          bgColor="bg-blue-500/20"
          isLoading={isLoading}
        />
        <KPICard
          title="Low Stock Alerts"
          value={lowStock}
          subtitle="Items below reorder level"
          icon={Archive}
          color="text-red-500"
          bgColor="bg-red-500/20"
          isLoading={isLoading}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        page={page}
        total={data?.meta.total || 0}
        pageCount={data?.meta.totalPages || 1}
        onPageChange={setPage}
        emptyTitle="No inventory items found"
        emptyDescription="Add an item to get started."
      />
    </div>
  );
};

export default Inventory;
