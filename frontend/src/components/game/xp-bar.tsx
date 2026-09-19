'use client';

import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

export interface XPBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

// Display-only experience bar. Numeric progress is passed in and rendered as
// text; this component never computes XP, levels, or rewards.
export function XPBar({
  value,
  max,
  label,
  className,
}: XPBarProps): React.JSX.Element {
  const reduced = usePrefersReducedMotion();
  const clamped = Math.min(Math.max(value, 0), max);
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        className="pixel-corners-sm pixel-frame h-4 w-full overflow-hidden"
      >
        <div
          className="pixel-steps h-full bg-ascent"
          style={{
            width: `${max === 0 ? 0 : (clamped / max) * 100}%`,
            transitionDuration: reduced ? '0.01ms' : undefined,
          }}
        />
      </div>
      <p className="font-display text-xs tracking-wide text-muted uppercase">
        {label}: {clamped} / {max} XP
      </p>
    </div>
  );
}
