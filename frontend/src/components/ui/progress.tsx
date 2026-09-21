'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const trackStyles = cva(
  'h-3 w-full overflow-hidden rounded-sm border border-line bg-surface-sunken p-0.5',
);
const fillStyles = cva(
  'h-full rounded-xs transition-[width] duration-base ease-ui',
  {
    variants: {
      variant: {
        ascent: 'progress-glow-ascent bg-ascent',
        reward: 'progress-glow-reward bg-reward',
      },
    },
    defaultVariants: { variant: 'ascent' },
  },
);

export interface ProgressProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof fillStyles> {
  value: number;
  max?: number;
  label: string;
}

// Determinate progress with a visible text label: state is never color-only.
export function Progress({
  value,
  max = 100,
  label,
  variant,
  className,
  ...props
}: ProgressProps): React.JSX.Element {
  const reduced = usePrefersReducedMotion();
  const clamped = Math.min(Math.max(value, 0), max);
  return (
    <div className={cn('flex flex-col gap-1', className)} {...props}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        className={trackStyles()}
      >
        <div
          className={cn(fillStyles({ variant }))}
          style={{
            width: `${max === 0 ? 0 : (clamped / max) * 100}%`,
            transitionDuration: reduced ? '0.01ms' : undefined,
          }}
        />
      </div>
      <p className="font-sans text-sm text-muted">
        {label}: {clamped} / {max}
      </p>
    </div>
  );
}
