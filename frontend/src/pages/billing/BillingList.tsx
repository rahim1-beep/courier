import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Filter, Eye } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { queryKeys } from '../../api/queryKeys';
import { billingApi } from '../../api/billing.api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceStatus, Invoice } from '../../types';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';

const BillingList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.billing.list({ page, limit: 10, search, status: statusFilter }),
    queryFn: () => billingApi.findAll({ page, limit: 10, search, status: statusFilter }),
  });

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: (info: any) => <span className="font-mono text-indigo-400 font-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (info: any) => {
        const customer = info.getValue();
        return (
          <div className="flex flex-col">
            <span className="text-primary font-medium">{customer?.user?.firstName} {customer?.user?.lastName}</span>
            <span className="text-[10px] text-muted uppercase tracking-wider">{customer?.companyName || 'Individual'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: (info: any) => <span className="font-mono font-semibold text-primary">{formatCurrency(info.getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => (
        <button
          onClick={() => {
            setSelectedInvoice(info.row.original);
            setIsDrawerOpen(true);
          }}
          className="p-2 rounded-lg hover:bg-elevated transition-colors text-muted hover:text-primary"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title">Billing & Invoices</h1>
          <p className="text-secondary mt-1">Manage customer invoices, automated billing, and payment tracking.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 v2-glass !rounded-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by Invoice # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="v2-input pl-9"
          />
        </div>
        
        <div className="w-full sm:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="v2-input pl-9 appearance-none"
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
        emptyDescription="Invoices are generated from shipments automatically."
      />

      <InvoiceDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default BillingList;
