import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, UserPlus } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { KPICard } from '../../components/common/KPICard';
import { queryKeys } from '../../api/queryKeys';
import { employeesApi } from '../../api/employees.api';
import { CreateEmployeeDrawer } from './CreateEmployeeDrawer';

const EmployeesList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employees.list({ page, limit: 10 }),
    queryFn: () => employeesApi.findAll({ page, limit: 10 }),
  });

  const columns = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: (info: any) => <span className="font-medium text-primary">{info.row.original.firstName} {info.row.original.lastName}</span>,
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
      cell: (info: any) => info.getValue() || '-',
    },
    {
      accessorKey: 'branch.name',
      header: 'Branch',
      cell: (info: any) => info.getValue() || 'Unassigned',
    },
    {
      accessorKey: 'position',
      header: 'Designation',
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      cell: (info: any) => info.getValue() ? `Rs ${Number(info.getValue()).toLocaleString()}` : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title">Employees</h1>
          <p className="text-secondary mt-1">Manage staff, designations, and salaries.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center v2-btn-primary"
        >
          <UserPlus className="w-4 h-4 mr-2 shrink-0" />
          Add Employee
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Total Employees"
          value={data?.meta.total || 0}
          icon={Briefcase}
          color="text-brand-500"
          bgColor="bg-brand-subtle"
          gradientFrom="#6366F1"
          gradientTo="#818CF8"
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
        emptyTitle="No employees found"
        emptyDescription="Add an employee to get started."
      />

      <CreateEmployeeDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default EmployeesList;
