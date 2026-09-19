'use client';

import { createContext, useCallback, useContext, useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: 'neutral' | 'ascent' | 'danger';
}

interface ToastContextValue {
  notify: (toast: Omit<ToastData, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}

// Transient notifications only: each toast is a polite live-region status
// with a dismiss action. Persistent or critical messages belong inline.
export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const baseId = useId();

  const notify = useCallback(
    (toast: Omit<ToastData, 'id'>): void => {
      const id = `${baseId}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
      setToasts((current) => [...current, { ...toast, id }]);
    },
    [baseId],
  );

  const dismiss = useCallback((id: string): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start justify-between gap-3 rounded-md border border-line bg-surface-raised p-4 shadow-soft',
              toast.variant === 'ascent' && 'border-ascent/60',
              toast.variant === 'danger' && 'border-danger/60',
            )}
          >
            <div>
              <p className="font-sans text-sm font-bold text-ink">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 font-sans text-sm text-muted">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={`Dismiss: ${toast.title}`}
              className="rounded-sm p-1 text-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ascent"
            >
              <X aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
