'use client';

import { Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AchievementCardProps {
  title: string;
  description: string;
  unlocked: boolean;
  emblemSrc?: string;
  rarity?: string;
  className?: string;
}

export function AchievementCard({
  title,
  description,
  unlocked,
  emblemSrc,
  rarity,
  className,
}: AchievementCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'pixel-corners-sm relative flex items-center gap-4 overflow-hidden border-2 p-4',
        unlocked
          ? 'border-reward bg-surface-raised shadow-hard-amber'
          : 'border-line bg-surface-sunken opacity-85',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pixel-corners-sm flex h-16 w-16 shrink-0 items-center justify-center border-2',
          unlocked
            ? 'border-reward bg-reward/10 text-reward'
            : 'border-line bg-surface-raised text-muted/70',
        )}
      >
        {unlocked && emblemSrc ? (
          <img src={emblemSrc} alt="" className="pixel-art h-11 w-11" />
        ) : unlocked ? (
          <Trophy className="h-7 w-7" strokeWidth={2} />
        ) : (
          <Lock className="h-6 w-6" strokeWidth={2} />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        {rarity && (
          <span className="game-label text-[10px] text-reward">{rarity}</span>
        )}
        <span className="font-display text-lg font-bold text-ink">{title}</span>
        <span className="font-sans text-sm text-muted">{description}</span>
        <span className="game-label mt-1 text-[10px] text-muted">
          {unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </span>
    </div>
  );
}
