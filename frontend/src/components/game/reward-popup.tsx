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
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return (): void => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-surface-sunken/85"
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
        className="pixel-corners pixel-grid pixel-frame-reward relative w-full max-w-md p-8 text-center"
      >
        <span
          aria-hidden="true"
          className="pixel-corners-sm mx-auto mb-5 flex h-20 w-20 items-center justify-center border-2 border-reward bg-surface-sunken text-reward shadow-hard-amber"
        >
          <Trophy className="h-9 w-9" strokeWidth={2} />
        </span>
        <span className="game-label text-xs text-reward">Quest reward</span>
        <h2
          id="reward-title"
          className="mt-1 font-display text-2xl font-bold tracking-wide text-ink"
        >
          {title}
        </h2>
        <p
          id="reward-description"
          className="mt-2 font-sans text-sm text-muted"
        >
          {description}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-reward px-6 font-sans text-sm font-bold text-reward-ink outline-none transition-transform duration-quick ease-ui hover:-translate-y-0.5 hover:brightness-105 active:translate-y-px"
        >
          {dismissLabel}
        </button>
      </motion.div>
    </div>
  );
}
