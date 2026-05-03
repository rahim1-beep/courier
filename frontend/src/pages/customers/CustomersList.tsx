import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, UserPlus } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { queryKeys } from '../../api/queryKeys';
import { customersApi } from '../../api/customers.api';
import { CreateCustomerDrawer } from './CreateCustomerDrawer';

const CustomersList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.customers.list({ page, limit: 10, search }),
    queryFn: () => customersApi.findAll({ page, limit: 10, search }),
  });

  const columns = [
    {
      accessorKey: 'user.firstName',
      header: 'Name',
      cell: (info: any) => <span className="font-medium text-primary">{info.row.original.user?.firstName} {info.row.original.user?.lastName}</span>,
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: (info: any) => info.getValue() || '-',
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
      cell: (info: any) => info.getValue() || '-',
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },
    {
      accessorKey: 'customPricing',
      header: 'Custom Pricing',
      cell: (info: any) => (
        <span className={`px-2 py-1 rounded text-[11px] font-semibold tracking-wide ${info.getValue() ? 'bg-brand-subtle text-brand-400' : 'bg-elevated text-secondary'}`}>
          {info.getValue() ? 'ENABLED' : 'STANDARD'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title">Customers</h1>
          <p className="text-secondary mt-1">Manage corporate and retail clients.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center v2-btn-primary"
        >
          <UserPlus className="w-4 h-4 mr-2 shrink-0" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex p-4 rounded-xl border border-default v2-glass">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 v2-input"
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
        emptyTitle="No customers found"
        emptyDescription="Add a customer to get started."
      />

      <CreateCustomerDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default CustomersList;
