import React from 'react';
import { Package } from 'lucide-react';
import { cn } from '../../utils/cn';
import { APP_NAME } from '../../utils/constants';

interface AppLogoProps {
  collapsed?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ collapsed = false, className }) => {
  return (
    <div className={cn("flex items-center gap-3 overflow-hidden", className)} title={APP_NAME}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shrink-0 shadow-lg shadow-blue-500/20">
        <Package className="w-5 h-5 text-white" />
        {/* Animated swoosh overlay to signify 'Swift' */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="w-[150%] h-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite_ease-in-out_skewX(-20deg)]" />
        </div>
      </div>
      {!collapsed && (
        <span className="text-xl font-bold tracking-tight text-white truncate min-w-0">
          {APP_NAME}
        </span>
      )}
    </div>
  );
};
