import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { EmptyState } from './EmptyState';
import { PaginationBar } from './PaginationBar';
import { Database } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pageCount?: number;
  page?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageCount = 1,
  page = 1,
  total = 0,
  onPageChange,
  emptyTitle = 'No records found',
  emptyDescription = 'There is no data to display here.',
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-default overflow-hidden bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left text-primary">
            <thead className="text-[11px] uppercase tracking-wide bg-canvas dark:bg-elevated text-muted border-b border-subtle sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3 font-semibold whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-subtle animate-pulse bg-canvas/50">
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-elevated rounded w-2/3"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-subtle hover:bg-canvas dark:hover:bg-elevated transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center bg-surface">
                    <EmptyState 
                      icon={Database} 
                      title={emptyTitle} 
                      description={emptyDescription} 
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {onPageChange && total > 0 && !isLoading && (
        <PaginationBar 
          page={page} 
          totalPages={pageCount} 
          total={total} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
}
