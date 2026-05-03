import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { queryKeys } from '../../api/queryKeys';
import { shipmentsApi } from '../../api/shipments.api';
import { formatDate, formatWeight } from '../../utils/formatters';

const PortalShipments: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.shipments.list({ page, limit: 10, search }),
    queryFn: () => shipmentsApi.findAll({ page, limit: 10, search }),
  });

  const columns = [
    {
      accessorKey: 'trackingId',
      header: 'Tracking ID',
      cell: (info: any) => <span className="font-mono text-blue-400 font-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: 'detail.receiverName',
      header: 'Receiver',
      cell: (info: any) => info.getValue() || '-',
    },
    {
      accessorKey: 'detail.receiverAddress',
      header: 'Destination',
      cell: (info: any) => <span className="truncate max-w-[200px] block" title={info.getValue()}>{info.getValue() || '-'}</span>,
    },
    {
      accessorKey: 'weight',
      header: 'Weight',
      cell: (info: any) => formatWeight(info.getValue()),
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
          <h1 className="text-2xl font-bold text-white tracking-tight">My Shipments</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage all your deliveries.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex p-4 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Tracking ID or Receiver..."
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
        emptyTitle="No shipments found"
        emptyDescription="You haven't created any shipments yet."
      />
    </div>
  );
};

export default PortalShipments;
