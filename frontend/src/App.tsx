import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Role } from './types';

// Layouts & Guards
import { AppLayout } from './components/layout/AppLayout';
import { CustomerPortalLayout } from './components/layout/CustomerPortalLayout';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { GuestRoute } from './components/guards/GuestRoute';
import { RoleRoute } from './components/guards/RoleRoute';

// Lazy loaded pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const ShipmentsList = React.lazy(() => import('./pages/shipments/ShipmentsList'));
const ShipmentDetail = React.lazy(() => import('./pages/shipments/ShipmentDetail'));
const CustomersList = React.lazy(() => import('./pages/customers/CustomersList'));
const BillingList = React.lazy(() => import('./pages/billing/BillingList'));
const Accounting = React.lazy(() => import('./pages/accounting/Accounting'));
const EmployeesList = React.lazy(() => import('./pages/employees/EmployeesList'));
const Inventory = React.lazy(() => import('./pages/inventory/Inventory'));
const Manifests = React.lazy(() => import('./pages/manifests/Manifests'));
const Tariffs = React.lazy(() => import('./pages/tariffs/Tariffs'));
const AuditLogs = React.lazy(() => import('./pages/audit/AuditLogs'));
const Branches = React.lazy(() => import('./pages/branches/Branches'));
const Attendance = React.lazy(() => import('./pages/attendance/Attendance'));

// Customer Portal Pages
const PortalDashboard = React.lazy(() => import('./pages/customer-portal/PortalDashboard'));
const PortalShipments = React.lazy(() => import('./pages/customer-portal/PortalShipments'));
const PortalBilling = React.lazy(() => import('./pages/customer-portal/PortalBilling'));
const PortalBalance = React.lazy(() => import('./pages/customer-portal/PortalBalance'));

const LoadingFallback = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <span className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public / Guest Routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Protected Employee/Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN, Role.EMPLOYEE]} />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/shipments" element={<ShipmentsList />} />
                  <Route path="/shipments/:id" element={<ShipmentDetail />} />
                  <Route path="/customers" element={<CustomersList />} />
                  <Route path="/billing" element={<BillingList />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/manifests" element={<Manifests />} />
                  <Route path="/attendance" element={<Attendance />} />
                  
                  {/* Super Admin Only */}
                  <Route element={<RoleRoute allowedRoles={[Role.SUPER_ADMIN]} />}>
                    <Route path="/accounting" element={<Accounting />} />
                    <Route path="/employees" element={<EmployeesList />} />
                    <Route path="/tariffs" element={<Tariffs />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/branches" element={<Branches />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>

              {/* Customer Portal Routes */}
              <Route element={<RoleRoute allowedRoles={[Role.CUSTOMER]} />}>
                <Route element={<CustomerPortalLayout />}>
                  <Route path="/customer-portal" element={<PortalDashboard />} />
                  <Route path="/customer-portal/shipments" element={<PortalShipments />} />
                  <Route path="/customer-portal/billing" element={<PortalBilling />} />
                  <Route path="/customer-portal/balance" element={<PortalBalance />} />
                  <Route path="*" element={<Navigate to="/customer-portal" replace />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      
      <Toaster 
        theme="dark" 
        position="top-right" 
        richColors 
        offset={16}
        toastOptions={{
          className: 'bg-slate-900 border-slate-800 text-slate-100',
        }}
      />
    </>
  );
};
