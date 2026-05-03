import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
