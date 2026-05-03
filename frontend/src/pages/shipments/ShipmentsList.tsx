import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PackagePlus, Search, Filter } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { queryKeys } from '../../api/queryKeys';
import { shipmentsApi } from '../../api/shipments.api';
import { Shipment, ShipmentStatus } from '../../types';
import { formatDate, formatWeight } from '../../utils/formatters';
import { CreateShipmentDrawer } from './CreateShipmentDrawer';

const ShipmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.shipments.list({ page, limit: 10, search, status: statusFilter }),
    queryFn: () => shipmentsApi.findAll({ page, limit: 10, search, status: statusFilter }),
  });

  const columns = [
    {
      accessorKey: 'trackingId',
      header: 'Tracking ID',
      cell: (info: any) => (
        <span className="font-mono text-blue-400 font-medium cursor-pointer hover:underline" onClick={() => navigate(`/shipments/${info.row.original.id}`)}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: (info: any) => info.getValue() || info.row.original.customerId,
    },
    {
      accessorKey: 'detail.receiverName',
      header: 'Receiver',
      cell: (info: any) => info.getValue() || '-',
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
          <h1 className="text-title">Shipments</h1>
          <p className="text-secondary mt-1">Manage and track all logistics operations.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center v2-btn-primary"
        >
          <PackagePlus className="w-4 h-4 mr-2" />
          Create Shipment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 v2-glass rounded-xl border border-default">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 v2-input"
          />
        </div>
        
        <div className="w-full sm:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 v2-input appearance-none"
          >
            <option value="">All Statuses</option>
            {Object.values(ShipmentStatus).map(status => (
              <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
            ))}
          </select>
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
        emptyDescription="Try adjusting your search or filters."
      />

      <CreateShipmentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default ShipmentsList;
