'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/hooks/use-focus-trap';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

// Modal dialog: focus trap, Escape to close, overlay click to close, labelled
// by its real heading. Returns focus to the invoker on close.
export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: DialogProps): React.JSX.Element | null {
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return (): void => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-surface-sunken/80"
        onClick={onClose}
      />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-md rounded-lg border border-line-strong bg-surface-raised p-6 shadow-soft',
          className,
        )}
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-bold text-ink">{title}</h2>
            {description && (
              <p className="mt-1 font-sans text-sm text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid min-h-11 min-w-11 place-items-center rounded-md text-muted outline-none transition-colors hover:bg-surface-elevated hover:text-ink"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
