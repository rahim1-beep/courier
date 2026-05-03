import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileBox, Plus, Search } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { queryKeys } from '../../api/queryKeys';
import { manifestsApi } from '../../api/manifests.api';
import { formatDate } from '../../utils/formatters';

const Manifests: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.manifests.list({ page, limit: 10, search }),
    queryFn: () => manifestsApi.findAll({ page, limit: 10, search }),
  });

  const columns = [
    {
      accessorKey: 'manifestNumber',
      header: 'Manifest #',
      cell: (info: any) => <span className="font-mono text-blue-400 font-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: 'origin.name',
      header: 'Origin Branch',
      cell: (info: any) => info.getValue() || '-',
    },
    {
      accessorKey: 'destination.name',
      header: 'Destination Branch',
      cell: (info: any) => info.getValue() || '-',
    },
    {
      accessorKey: 'vehicleNumber',
      header: 'Vehicle',
      cell: (info: any) => info.getValue() || 'Unassigned',
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
      cell: (info: any) => info.getValue() || 'Unassigned',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manifests</h1>
          <p className="text-slate-400 text-sm mt-1">Manage inter-branch shipment transfers.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Create Manifest
        </button>
      </div>

      {/* Filters */}
      <div className="flex p-4 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Manifest # or Vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
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
        emptyTitle="No manifests found"
        emptyDescription="Create a manifest to group shipments."
      />
    </div>
  );
};

export default Manifests;
