import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({ page, totalPages, total, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between border-t border-slate-700/50 pt-4", className)}>
      <div className="text-sm text-slate-400">
        Showing <span className="font-medium text-white">{((page - 1) * 10) + 1}</span> to <span className="font-medium text-white">{Math.min(page * 10, total)}</span> of <span className="font-medium text-white">{total}</span> results
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-md bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm text-slate-300 px-2">
          Page {page} of {totalPages}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-md bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
