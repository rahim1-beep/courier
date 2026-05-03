import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { queryKeys } from '../../api/queryKeys';
import { billingApi } from '../../api/billing.api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceStatus } from '../../types';

const PortalBilling: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.billing.list({ page, limit: 10, search, status: statusFilter }),
    queryFn: () => billingApi.findAll({ page, limit: 10, search, status: statusFilter }),
  });

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: (info: any) => <span className="font-mono text-white">{info.getValue()}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: (info: any) => <span className="font-medium text-white">{formatCurrency(info.getValue())}</span>,
    },
    {
      accessorKey: 'amountPaid',
      header: 'Paid',
      cell: (info: any) => <span className="text-green-400">{formatCurrency(info.getValue() || 0)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Download PDF">
          <Download className="w-4 h-4" />
        </button>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Invoices</h1>
          <p className="text-slate-400 text-sm mt-1">View and download your invoices.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="w-full sm:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">All Statuses</option>
            {Object.values(InvoiceStatus).map(status => (
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
        emptyTitle="No invoices found"
        emptyDescription="You have no billing history."
      />
    </div>
  );
};

export default PortalBilling;
