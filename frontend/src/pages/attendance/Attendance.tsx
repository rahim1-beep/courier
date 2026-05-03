import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, MapPin, CheckCircle } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { queryKeys } from '../../api/queryKeys';
import { authApi } from '../../api/auth.api'; // Assuming attendance is tied to employee auth for now
import { formatDateTime } from '../../utils/formatters';
import { toast } from 'sonner';
// import { attendanceApi } from '../../api/attendance.api'; // To be created if standalone

const Attendance: React.FC = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Mock data since we don't have a dedicated attendance API service yet
  const { data, isLoading } = useQuery({
    queryKey: ['attendance', { page }],
    queryFn: async () => {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: [
          { id: '1', date: new Date().toISOString(), status: 'PRESENT', employee: { name: 'John Doe' }, ipAddress: '192.168.1.1' }
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
      };
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      // Mock mark attendance
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    },
    onSuccess: () => {
      toast.success('Attendance marked successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  const columns = [
    {
      accessorKey: 'employee.name',
      header: 'Employee Name',
      cell: (info: any) => <span className="font-medium text-white">{info.getValue()}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Time',
      cell: (info: any) => formatDateTime(info.getValue()),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: (info: any) => <span className="font-mono text-xs text-slate-400">{info.getValue()}</span>,
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Mark and track daily employee attendance.</p>
        </div>
        <button 
          onClick={() => markAttendanceMutation.mutate()}
          disabled={markAttendanceMutation.isPending}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] font-medium disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {markAttendanceMutation.isPending ? 'Marking...' : 'Mark Attendance Today'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Present Today"
          value={data?.meta.total || 0}
          icon={Clock}
          color="text-blue-500"
          bgColor="bg-blue-500/20"
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
        emptyTitle="No attendance records"
        emptyDescription="No records found for the selected criteria."
      />
    </div>
  );
};

export default Attendance;
