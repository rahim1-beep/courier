import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, ArrowDownRight, ArrowUpRight, Plus, Download } from 'lucide-react';
import { KPICard } from '../../components/common/KPICard';
import { DataTable } from '../../components/common/DataTable';
import { queryKeys } from '../../api/queryKeys';
import { accountingApi } from '../../api/accounting.api';
import { formatCurrency, formatDate } from '../../utils/formatters';

import { RecordPaymentDrawer } from './RecordPaymentDrawer';

const Accounting: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: queryKeys.accounting.ledger({ page, limit: 10 }),
    queryFn: () => accountingApi.getLedger({ page, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'entryNumber',
      header: 'Entry #',
      cell: (info: any) => <span className="font-mono text-indigo-400 text-[11px] uppercase">{info.getValue()}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info: any) => (
        <div className="flex flex-col max-w-[300px]">
          <span className="text-primary font-medium truncate">{info.getValue()}</span>
          <span className="text-[10px] text-muted uppercase tracking-wider">
            {info.row.original.referenceType.replace(/_/g, ' ')} • {info.row.original.referenceId.substring(0, 8)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'debit',
      header: 'Debit (-)',
      cell: (info: any) => {
        const val = Number(info.getValue());
        return val > 0 ? (
          <span className="font-mono text-rose-500">-{formatCurrency(val)}</span>
        ) : <span className="text-muted">—</span>;
      },
    },
    {
      accessorKey: 'credit',
      header: 'Credit (+)',
      cell: (info: any) => {
        const val = Number(info.getValue());
        return val > 0 ? (
          <span className="font-mono text-emerald-500">+{formatCurrency(val)}</span>
        ) : <span className="text-muted">—</span>;
      },
    },
    {
      accessorKey: 'runningBalance',
      header: 'Balance',
      cell: (info: any) => (
        <span className={`font-mono font-semibold ${Number(info.getValue()) < 0 ? 'text-rose-400' : 'text-primary'}`}>
          {formatCurrency(info.getValue())}
        </span>
      ),
    },
  ];

  // Totals from current page (for cards)
  const totalIn = transactionsData?.data?.reduce((sum: any, t: any) => sum + Number(t.credit), 0) || 0;
  const totalOut = transactionsData?.data?.reduce((sum: any, t: any) => sum + Number(t.debit), 0) || 0;
  const currentBalance = transactionsData?.data?.[0]?.runningBalance || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title">Accounting Ledger</h1>
          <p className="text-secondary mt-1">Track all financial transactions and real-time balances.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center v2-btn-ghost text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center v2-btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Current Balance"
          value={Number(currentBalance)}
          subtitle="Real-time ledger balance"
          icon={Calculator}
          color={Number(currentBalance) >= 0 ? "text-indigo-500" : "text-rose-500"}
          bgColor={Number(currentBalance) >= 0 ? "bg-indigo-500/10" : "bg-rose-500/10"}
          isCurrency
          isLoading={isLoading}
        />
        <KPICard
          title="Total Inflows"
          value={totalIn}
          subtitle="Total credit entries"
          icon={ArrowDownRight}
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
          isCurrency
          isLoading={isLoading}
        />
        <KPICard
          title="Total Outflows"
          value={totalOut}
          subtitle="Total debit entries"
          icon={ArrowUpRight}
          color="text-rose-500"
          bgColor="bg-rose-500/10"
          isCurrency
          isLoading={isLoading}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={transactionsData?.data || []}
        isLoading={isLoading}
        page={page}
        total={transactionsData?.meta.total || 0}
        pageCount={transactionsData?.meta.totalPages || 1}
        onPageChange={setPage}
        emptyTitle="No transactions found"
        emptyDescription="All financial records will appear here once entries are recorded."
      />

      <RecordPaymentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default Accounting;
