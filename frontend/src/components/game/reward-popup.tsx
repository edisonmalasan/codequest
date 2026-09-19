'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { useFocusTrap } from '@/hooks/use-focus-trap';

export interface RewardPopupProps {
  open: boolean;
  title: string;
  description: string;
  dismissLabel?: string;
  onClose: () => void;
}

// Display-only reward celebration. Content arrives as props; reward rules
// belong to the backend. Motion collapses to an instant appearance under
// reduced motion; focus moves to dismiss and returns on close.
export function RewardPopup({
  open,
  title,
  description,
  dismissLabel = 'Continue',
  onClose,
}: RewardPopupProps): React.JSX.Element | null {
  const reduce = useReducedMotion();
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
    return (): void => {
      document.removeEventListener('keydown', onKeyDown);
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
      />
      <motion.div
        ref={trapRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reward-title"
        aria-describedby="reward-description"
        initial={reduce ? false : { opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="pixel-corners pixel-frame-reward relative w-full max-w-sm p-6 text-center"
      >
        <span
          aria-hidden="true"
          className="pixel-corners-sm mx-auto mb-3 flex h-14 w-14 items-center justify-center bg-reward text-reward-ink"
        >
          <Trophy className="h-7 w-7" strokeWidth={2} />
        </span>
        <h2
          id="reward-title"
          className="font-display text-lg font-bold tracking-wide text-ink uppercase"
        >
          {title}
        </h2>
        <p
          id="reward-description"
          className="mt-1 font-sans text-sm text-muted"
        >
          {description}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 inline-flex h-10 items-center rounded-sm bg-reward px-6 font-sans text-sm font-bold text-reward-ink outline-none transition-transform duration-quick ease-ui hover:brightness-110 active:translate-y-px focus-visible:ring-2 focus-visible:ring-ink"
        >
          {dismissLabel}
        </button>
      </motion.div>
    </div>
  );
}
