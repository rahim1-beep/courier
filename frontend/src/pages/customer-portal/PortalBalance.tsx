import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { KPICard } from '../../components/common/KPICard';
import { queryKeys } from '../../api/queryKeys';
import { accountingApi } from '../../api/accounting.api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PortalBalance: React.FC = () => {
  const [page, setPage] = useState(1);

  // For a customer, their ledger is just their own transactions
  // The API service would need a customer specific endpoint or implicit filter
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.accounting.ledger({ page, limit: 10 }),
    queryFn: () => accountingApi.getLedger({ page, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const currentBalance = data?.data?.[0]?.runningBalance || 0;

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'referenceType',
      header: 'Type',
      cell: (info: any) => info.getValue().replace(/_/g, ' '),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (info: any) => {
        const isCredit = info.row.original.type === 'CREDIT';
        return (
          <span className={`font-medium ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
            {isCredit ? '+' : '-'}{formatCurrency(info.getValue())}
          </span>
        );
      },
    },
    {
      accessorKey: 'runningBalance',
      header: 'Balance',
      cell: (info: any) => <span className="font-medium text-white">{formatCurrency(info.getValue())}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Account Balance</h1>
          <p className="text-slate-400 text-sm mt-1">View your transaction history and current ledger balance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Current Balance Due"
          value={Number(currentBalance) < 0 ? Math.abs(Number(currentBalance)) : 0}
          icon={Calculator}
          color="text-red-500"
          bgColor="bg-red-500/20"
          isCurrency
          isLoading={isLoading}
        />
        <KPICard
          title="Prepaid Credit"
          value={Number(currentBalance) > 0 ? Number(currentBalance) : 0}
          icon={Calculator}
          color="text-green-500"
          bgColor="bg-green-500/20"
          isCurrency
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
        emptyTitle="No transactions found"
        emptyDescription="Your account ledger is empty."
      />
    </div>
  );
};

export default PortalBalance;
