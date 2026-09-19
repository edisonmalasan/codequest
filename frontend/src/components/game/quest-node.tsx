'use client';

import { Check, Circle, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/cn';

export type QuestStatus =
  'not_started' | 'in_progress' | 'completed' | 'locked';

export interface QuestNodeProps {
  status: QuestStatus;
  label: string;
  onSelect?: () => void;
  className?: string;
}

const statusMeta: Record<QuestStatus, { text: string; Icon: typeof Check }> = {
  not_started: { text: 'Not started', Icon: Circle },
  in_progress: { text: 'In progress', Icon: Play },
  completed: { text: 'Completed', Icon: Check },
  locked: { text: 'Locked', Icon: Lock },
};

// Display-only quest node. Status arrives as a prop; prerequisite evaluation
// belongs to the backend. Locked nodes are inert; others invoke onSelect.
export function QuestNode({
  status,
  label,
  onSelect,
  className,
}: QuestNodeProps): React.JSX.Element {
  const { text, Icon } = statusMeta[status];
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'pixel-corners-sm flex h-8 w-8 items-center justify-center',
          status === 'completed' && 'bg-ascent text-ascent-ink',
          status === 'in_progress' &&
            'pixel-frame bg-surface-raised text-ascent',
          status === 'not_started' && 'bg-surface-raised text-muted',
          status === 'locked' && 'bg-surface-sunken text-muted/60',
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col items-start">
        <span className="font-sans text-sm font-semibold text-ink">
          {label}
        </span>
        <span className="font-display text-xs tracking-wide text-muted uppercase">
          {text}
        </span>
      </span>
    </>
  );

  if (status === 'locked' || onSelect === undefined) {
    return (
      <li
        aria-disabled={status === 'locked' || undefined}
        className={cn('flex items-center gap-3', className)}
      >
        {inner}
      </li>
    );
  }
  return (
    <li className={cn('flex', className)}>
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${label}, ${text}`}
        className="flex items-center gap-3 rounded-sm p-1 -m-1 outline-none transition-transform duration-quick ease-ui hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ascent"
      >
        {inner}
      </button>
    </li>
  );
}
