'use client';

import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, InfoIcon, CloseIcon } from '@/components/global/icons';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info';
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idGen = useId();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' = 'success', duration: number = 3500) => {
      const id = `${idGen}-${Date.now()}-${Math.random()}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [idGen, removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast viewport */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border text-sm font-body animate-in slide-in-from-bottom-2 duration-150',
              toast.type === 'success'
                ? 'bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] border-[var(--color-primary-container)]'
                : 'bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] border-[var(--color-border-default)]'
            )}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircleIcon size={18} className="text-[var(--color-primary)] shrink-0" />
              ) : (
                <InfoIcon size={18} className="text-[var(--color-secondary)] shrink-0" />
              )}
              <span className="font-medium text-xs md:text-sm">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 -mr-1 text-[var(--color-outline)] hover:text-[var(--color-on-surface)] rounded transition-colors cursor-pointer"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
