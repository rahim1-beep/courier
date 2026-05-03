import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: '480px' | '600px';
  children: React.ReactNode;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  disableSubmit?: boolean;
}

export const SlideDrawer: React.FC<SlideDrawerProps> = ({
  isOpen,
  onClose,
  title,
  width = '480px',
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  disableSubmit = false,
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[4px]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ 
              type: 'tween', 
              ease: [0.32, 0.72, 0, 1], 
              duration: 0.28,
            }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-[101] flex flex-col v2-glass !border-y-0 !border-r-0 shadow-[-8px_0_30px_rgba(0,0,0,0.12)]",
              width === '600px' ? "w-full max-w-[600px]" : "w-full max-w-[480px]"
            )}
          >
            {/* Header */}
            <div className="h-[64px] shrink-0 flex items-center justify-between px-6 border-b border-default bg-surface/50">
              <h2 className="text-[18px] font-semibold text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-secondary hover:text-primary hover:bg-elevated rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-canvas/30">
              {children}
            </div>

            {/* Footer */}
            <div className="h-[72px] shrink-0 flex items-center justify-end px-6 border-t border-subtle bg-surface/80 gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="v2-btn-ghost disabled:opacity-50"
              >
                Cancel
              </button>
              
              {onSubmit && (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting || disableSubmit}
                  className="v2-btn-primary flex items-center min-w-[100px] justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    submitLabel
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
