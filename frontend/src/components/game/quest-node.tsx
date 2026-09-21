'use client';

import { Check, Circle, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/cn';

export type QuestStatus =
  | 'not_started'
  | 'available'
  | 'in_progress'
  | 'current'
  | 'completed'
  | 'locked';

export interface QuestNodeProps {
  status: QuestStatus;
  label: string;
  onSelect?: () => void;
  className?: string;
}

const statusMeta: Record<QuestStatus, { text: string; Icon: typeof Check }> = {
  not_started: { text: 'Not started', Icon: Circle },
  available: { text: 'Available', Icon: Circle },
  in_progress: { text: 'In progress', Icon: Play },
  current: { text: 'Current quest', Icon: Play },
  completed: { text: 'Completed', Icon: Check },
  locked: { text: 'Locked', Icon: Lock },
};

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
          'pixel-corners-sm relative flex h-12 w-12 shrink-0 items-center justify-center border-2',
          status === 'completed' && 'border-ascent bg-ascent text-ascent-ink',
          (status === 'in_progress' || status === 'current') &&
            'border-reward bg-surface-sunken text-reward shadow-hard-amber',
          (status === 'not_started' || status === 'available') &&
            'border-discovery bg-surface-sunken text-discovery',
          status === 'locked' &&
            'border-line bg-surface-sunken text-muted opacity-80',
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col items-start rounded-sm bg-surface-sunken/90 px-2 py-1">
        <span className="font-sans text-sm font-bold text-ink">{label}</span>
        <span className="game-label text-[10px] text-muted">{text}</span>
      </span>
    </>
  );

  if (status === 'locked' || onSelect === undefined) {
    return (
      <li
        aria-disabled={status === 'locked' || undefined}
        className={cn('relative z-10 flex items-center gap-3', className)}
      >
        {inner}
      </li>
    );
  }
  return (
    <li className={cn('relative z-10 flex', className)}>
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${label}, ${text}`}
        className="flex min-h-14 items-center gap-3 rounded-sm p-1 -m-1 outline-none transition-transform duration-quick ease-ui hover:-translate-y-1"
      >
        {inner}
      </button>
    </li>
  );
}
