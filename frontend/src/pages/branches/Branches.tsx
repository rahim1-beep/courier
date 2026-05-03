import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Plus } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { queryKeys } from '../../api/queryKeys';
import { branchesApi } from '../../api/branches.api';
import { CreateBranchDrawer } from './CreateBranchDrawer';

const Branches: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.branches.list({ page, limit: 10 }),
    queryFn: () => branchesApi.findAll({ page, limit: 10 }),
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Branch Name',
      cell: (info: any) => <span className="font-medium text-primary">{info.getValue()}</span>,
    },
    {
      accessorKey: 'code',
      header: 'Branch Code',
      cell: (info: any) => <span className="font-mono text-brand-400">{info.getValue()}</span>,
    },
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      accessorKey: 'contactEmail',
      header: 'Contact Email',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title">Branches</h1>
          <p className="text-secondary mt-1">Manage company branches and locations.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center v2-btn-primary"
        >
          <Plus className="w-4 h-4 mr-2 shrink-0" />
          Add Branch
        </button>
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
        emptyTitle="No branches found"
        emptyDescription="Add a branch to get started."
      />

      <CreateBranchDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default Branches;
