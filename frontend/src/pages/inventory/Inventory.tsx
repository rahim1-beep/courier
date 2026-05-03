import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, Plus, UploadCloud, User } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { KPICard } from '../../components/common/KPICard';
import { queryKeys } from '../../api/queryKeys';
import { inventoryApi } from '../../api/inventory.api';
import { customersApi } from '../../api/customers.api';
import { formatDate } from '../../utils/formatters';
import { AddItemModal, BulkImportModal } from './InventoryModals';

const Inventory: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers.list({ limit: 100 }),
    queryFn: () => customersApi.findAll({ limit: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.inventory.list({ page, limit: 10, customerId: selectedCustomerId }),
    queryFn: () => inventoryApi.findAll({ page, limit: 10, customerId: selectedCustomerId }),
  });

  const totalItems = data?.meta?.total || 0;

  const columns = [
    {
      accessorKey: 'inventoryCode',
      header: 'Inventory Code',
      cell: (info: any) => <span className="font-mono text-blue-400 font-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (info: any) => (
        <div className="flex items-center">
          <User className="w-3.5 h-3.5 mr-2 text-slate-500" />
          <span className="text-slate-200">{info.getValue()?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: (info: any) => <span className="text-slate-400">{info.getValue()?.name || 'N/A'}</span>,
    },
    {
      accessorKey: '_count',
      header: 'Items',
      cell: (info: any) => (
        <div className="flex items-center">
          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-medium border border-blue-500/20">
            {info.getValue()?.items || 0}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: (info: any) => formatDate(info.getValue()),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inventory Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage packaging materials and customer-specific stock.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Bulk Import
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex-1 max-w-sm">
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block px-1">Filter by Customer</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full v2-input py-1.5"
          >
            <option value="">All Customers</option>
            {customers?.data.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Total Batches"
          value={totalItems}
          icon={Archive}
          color="text-blue-500"
          bgColor="bg-blue-500/20"
          isLoading={isLoading}
        />
        <KPICard
          title="Active Customers"
          value={customers?.data.length || 0}
          subtitle="Customers with inventory"
          icon={User}
          color="text-emerald-500"
          bgColor="bg-emerald-500/20"
          isLoading={isLoading}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        page={page}
        total={data?.meta.total || 0}
        pageCount={data?.meta.totalPages || 1}
        onPageChange={setPage}
        emptyTitle="No inventory found"
        emptyDescription="Select a customer or add a new item to get started."
      />

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <BulkImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
};

export default Inventory;
