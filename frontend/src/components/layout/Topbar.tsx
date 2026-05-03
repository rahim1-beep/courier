import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, LogOut, User } from 'lucide-react';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { APP_NAME } from '../../utils/constants';
import { cn } from '../../utils/cn';

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useUiStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Shipment Delivered', message: 'PK-123456 has been delivered to Karachi.', isRead: false, time: '10m ago' },
    { id: '2', title: 'New Invoice', message: 'Invoice INV-2024-001 has been generated.', isRead: false, time: '1h ago' },
    { id: '3', title: 'System Update', message: 'Scheduled maintenance this Sunday 2AM.', isRead: true, time: '2d ago' },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Breadcrumbs logic
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // Debounced search logic (Mocked for now)
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const timer = setTimeout(() => {
      // Mock search hit
      if (searchQuery.toUpperCase().includes('PK')) {
        setSearchResults([
          { id: '1', trackingId: 'PK-123456', status: 'IN_TRANSIT', customer: 'Acme Corp' }
        ]);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 v2-glass border-b border-default sticky top-0 z-30 transition-colors duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center text-[13px]">
        <span className="text-muted capitalize font-medium">{APP_NAME}</span>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          // Try to make it human readable, handle IDs (UUIDs are long)
          let displayName = name.replace(/-/g, ' ');
          if (displayName.length > 20 && !displayName.includes(' ')) {
            displayName = 'Detail';
          }
          
          return (
            <React.Fragment key={name}>
              <span className="mx-2 text-border-strong">/</span>
              {isLast ? (
                <span className="text-primary font-semibold capitalize">{displayName}</span>
              ) : (
                <Link to={routeTo} className="text-secondary hover:text-primary capitalize transition-colors font-medium">
                  {displayName}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right side tools */}
      <div className="flex items-center gap-2">
        
        {/* Global Search */}
        <div className="relative" ref={searchRef}>
          <div className={cn(
            "flex items-center bg-canvas border rounded-lg transition-all px-3",
            isSearchOpen ? "border-focus w-64 ring-[3px] ring-brand-glow" : "border-default w-48 hover:border-strong"
          )}>
            <Search className="w-4 h-4 text-secondary shrink-0" />
            <input
              type="text"
              placeholder="Search tracking ID..."
              className="w-full bg-transparent border-none focus:outline-none text-[13px] text-primary px-2 py-1.5 placeholder:text-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
            {isSearching && <span className="w-3 h-3 border-2 border-muted border-t-brand-500 rounded-full animate-spin shrink-0" />}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim().length >= 3 && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden py-2">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <button
                    key={result.id}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex flex-col transition-colors"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate(`/shipments/${result.id}`);
                    }}
                  >
                    <span className="font-mono text-sm text-blue-400 font-medium">{result.trackingId}</span>
                    <span className="text-xs text-slate-400">{result.customer} • {result.status}</span>
                  </button>
                ))
              ) : !isSearching ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No shipments found</div>
              ) : null}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-slate-700/50 bg-slate-900/30">
                <h3 className="font-semibold text-slate-200">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors group cursor-pointer",
                        !n.isRead && "bg-blue-500/5"
                      )}
                      onClick={() => toggleNotificationRead(n.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          <h4 className={cn("text-sm font-medium", !n.isRead ? "text-slate-200" : "text-slate-400")}>{n.title}</h4>
                        </div>
                        <span className="text-xs text-slate-500">{n.time}</span>
                      </div>
                      <p className={cn("text-xs", !n.isRead ? "text-slate-300" : "text-slate-500")}>{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">You have no notifications.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-2" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-slate-700/50 mb-1 bg-slate-900/30">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {user?.role}
                </div>
              </div>
              <Link to="/account" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>
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
  );
};
