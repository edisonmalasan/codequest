'use client';

import { cn } from '@/lib/cn';

export interface LevelBadgeProps {
  level: number;
  title?: string;
  className?: string;
}

// Display-only level emblem. The level number is passed in; derivation of
// levels from XP belongs to the backend and later phases.
export function LevelBadge({
  level,
  title,
  className,
}: LevelBadgeProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'pixel-corners pixel-frame-reward flex items-center gap-2 px-3 py-1.5',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="font-display text-lg font-bold text-reward"
      >
        {level}
      </span>
      <span className="font-display text-xs tracking-wide text-ink uppercase">
        Level {level}
        {title ? ` — ${title}` : ''}
      </span>
    </div>
  );
}
