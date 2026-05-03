import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, FileText, Archive, Users, Briefcase, 
  Clock, MapPin, Globe, CreditCard, Calculator, Activity, 
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { NAVIGATION } from '../../utils/constants';
import { AppLogo } from './AppLogo';
import { cn } from '../../utils/cn';

// Icon Map
const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Package, FileText, Archive, Users, Briefcase,
  Clock, MapPin, Globe, CreditCard, Calculator, Activity
};

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  // Filter navigation by user role
  const filteredNav = NAVIGATION.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(user.role))
  })).filter(group => group.items.length > 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 80 }}
      className="relative flex flex-col h-screen bg-[#1C2333] border-r border-white/10 z-40 shrink-0 text-[#F0F4FF]"
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <AppLogo collapsed={!sidebarOpen} className={cn("transition-all duration-300", !sidebarOpen && "mx-auto")} />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {filteredNav.map((group, groupIdx) => (
          <div key={group.group} className={cn("mb-6", groupIdx !== 0 && "mt-6")}>
            {sidebarOpen ? (
              <h3 className="px-3 text-[11px] font-bold text-[#8B95B0] uppercase tracking-wider mb-2">
                {group.group}
              </h3>
            ) : (
              <div className="w-full h-px bg-white/10 my-4" />
            )}
            
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = ICONS[item.icon] || Package;
                const isActive = location.pathname.startsWith(item.path);
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center transition-all group relative",
                      sidebarOpen ? "px-3 py-2.5 rounded-r-lg" : "p-3 justify-center rounded-lg",
                      isActive 
                        ? "bg-brand-subtle text-brand-300" 
                        : "text-[#8B95B0] hover:text-[#F0F4FF] hover:bg-white/5"
                    )}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    {isActive && sidebarOpen && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      />
                    )}
                    {isActive && !sidebarOpen && (
                      <motion.div 
                        layoutId="activeNavCollapsed"
                        className="absolute inset-0 border border-brand-500 rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.2)] pointer-events-none"
                      />
                    )}
                    
                    <Icon className={cn("shrink-0", sidebarOpen ? "w-5 h-5 mr-3" : "w-6 h-6")} />
                    
                    {sidebarOpen && (
                      <span className="font-medium text-[14px]">{item.name}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center w-full p-2 text-[#8B95B0] hover:text-[#F0F4FF] hover:bg-white/5 rounded-lg transition-colors",
            !sidebarOpen && "justify-center"
          )}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span className="text-[13px] font-medium">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
};
