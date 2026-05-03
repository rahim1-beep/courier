import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Search, Filter } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { queryKeys } from '../../api/queryKeys';
import { auditLogsApi } from '../../api/auditLogs.api';
import { formatDateTime } from '../../utils/formatters';

const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Fetching data
  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', { page, limit: 15, search }],
    queryFn: () => auditLogsApi.findAll({ page, limit: 15, search }),
  });

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: (info: any) => formatDateTime(info.getValue()),
    },
    {
      accessorKey: 'user.email',
      header: 'User',
      cell: (info: any) => <span className="font-medium text-slate-300">{info.getValue() || info.row.original.userId}</span>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: (info: any) => {
        const action = info.getValue() as string;
        let color = 'text-slate-300 bg-slate-700/50';
        if (action.includes('CREATE')) color = 'text-green-400 bg-green-500/10 border border-green-500/20';
        if (action.includes('UPDATE')) color = 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
        if (action.includes('DELETE')) color = 'text-red-400 bg-red-500/10 border border-red-500/20';
        
        return <span className={`px-2 py-1 rounded text-[10px] font-mono tracking-wider ${color}`}>{action}</span>;
      },
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
    },
    {
      accessorKey: 'entityId',
      header: 'Entity ID',
      cell: (info: any) => <span className="font-mono text-slate-500 text-xs">{info.getValue()?.substring(0, 8)}...</span>,
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: (info: any) => <span className="font-mono text-slate-400 text-xs">{info.getValue()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            System Audit Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Immutable record of all system activities and modifications.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex p-4 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, entity type, or user..."
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
        emptyTitle="No audit logs found"
        emptyDescription="System activity will be recorded here."
      />
    </div>
  );
};

export default AuditLogs;
