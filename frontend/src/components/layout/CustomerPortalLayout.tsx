import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Package, User, Calculator, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { AppLogo } from './AppLogo';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { cn } from '../../utils/cn';

export const CustomerPortalLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer-portal', icon: Package, exact: true },
    { name: 'My Shipments', path: '/customer-portal/shipments', icon: Package },
    { name: 'Billing & Invoices', path: '/customer-portal/billing', icon: FileText },
    { name: 'Account Balance', path: '/customer-portal/balance', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-base))] flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-6 lg:px-12 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <AppLogo />

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);
                
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-500/10 text-blue-400" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="w-px h-6 bg-slate-700 hidden md:block" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 pl-2 pr-3 rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {user?.name ? user.name.charAt(0) : 'C'}
              </div>
              <span className="text-sm font-medium text-slate-200 hidden sm:block">{user?.name}</span>
            </button>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-slate-700/50 mb-1 bg-slate-900/30">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link to="/customer-portal/account" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </Link>
                <div className="border-t border-slate-700/50 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
