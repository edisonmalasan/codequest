'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/hooks/use-focus-trap';

export interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

// Slide-over panel anchored right: same modal contract as Dialog (focus trap,
// Escape, overlay close), conventional panel styling.
export function Drawer({
  open,
  title,
  onClose,
  children,
  className,
}: DrawerProps): React.JSX.Element | null {
  const trapRef = useFocusTrap<HTMLElement>(open);

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
    <div className="fixed inset-0 z-40">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-surface-sunken/80"
        onClick={onClose}
      />
      <aside
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute top-0 right-0 flex h-full w-full max-w-sm flex-col border-l border-line bg-surface-raised p-6 shadow-soft',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-sans text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-sm p-1 text-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ascent"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
