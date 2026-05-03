import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}) => {
  const [shake, setShake] = React.useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              shake 
                ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } 
                : { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.3 } }
            }
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
          >
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                isDestructive ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
              )}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 mb-6">{description}</p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-70 flex items-center justify-center",
                    isDestructive 
                      ? "bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                      : "bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  )}
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
