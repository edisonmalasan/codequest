'use client';

import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

export interface XPBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

// Display-only HUD. Numeric values arrive as props; progression rules stay elsewhere.
export function XPBar({
  value,
  max,
  label,
  className,
}: XPBarProps): React.JSX.Element {
  const reduced = usePrefersReducedMotion();
  const clamped = Math.min(Math.max(value, 0), max);
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-end justify-between gap-3">
        <span className="game-label text-xs text-ink">{label}</span>
        <span className="font-mono text-xs font-bold text-ascent">
          {clamped} / {max} XP
        </span>
      </div>
      <p className="sr-only">
        {label}: {clamped} / {max} XP
      </p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        className="pixel-corners-sm relative h-6 w-full overflow-hidden border-2 border-line-strong bg-surface-sunken p-1 shadow-hard-sm"
      >
        <div
          className="pixel-highlight pixel-steps h-full bg-ascent"
          style={{
            width: `${max === 0 ? 0 : (clamped / max) * 100}%`,
            transitionDuration: reduced ? '0.01ms' : undefined,
          }}
        />
        <span
          aria-hidden="true"
          className="xp-segments absolute inset-1 opacity-60"
        />
      </div>
    </div>
  );
}
