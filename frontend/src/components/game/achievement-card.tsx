'use client';

import { Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AchievementCardProps {
  title: string;
  description: string;
  unlocked: boolean;
  className?: string;
}

// Display-only achievement. Unlock state arrives as a prop; earning rules
// belong to the backend and later phases. Locked cards show a silhouette plus
// explicit "Locked" text, never color alone.
export function AchievementCard({
  title,
  description,
  unlocked,
  className,
}: AchievementCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-md border p-4',
        unlocked
          ? 'border-reward/60 bg-surface-raised'
          : 'border-line bg-surface-sunken',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pixel-corners-sm flex h-12 w-12 shrink-0 items-center justify-center',
          unlocked
            ? 'bg-reward text-reward-ink'
            : 'bg-surface-raised text-muted/50',
        )}
      >
        {unlocked ? (
          <Trophy className="h-6 w-6" strokeWidth={2} />
        ) : (
          <Lock className="h-6 w-6" strokeWidth={2} />
        )}
      </span>
      <span className="flex flex-col">
        <span className="font-sans text-sm font-bold text-ink">{title}</span>
        <span className="font-sans text-sm text-muted">{description}</span>
        <span className="mt-0.5 font-display text-xs tracking-wide text-muted uppercase">
          {unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </span>
    </div>
  );
}
