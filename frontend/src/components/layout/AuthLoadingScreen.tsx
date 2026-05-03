import React from 'react';
import { AppLogo } from './AppLogo';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[hsl(var(--bg-base))] flex flex-col items-center justify-center z-[100]">
      <div className="flex flex-col items-center">
        <AppLogo className="mb-8 scale-150 transform" />
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          Authenticating...
        </div>
      </div>
      
      {/* Decorative gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};
