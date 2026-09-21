'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 font-sans text-xs font-bold whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-line bg-surface-elevated text-ink',
        ascent: 'border-ascent bg-ascent/15 text-ascent',
        reward: 'border-reward bg-reward/15 text-reward',
        danger: 'border-danger bg-danger/15 text-danger',
        outline: 'border-line-strong bg-transparent text-muted',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  variant,
  className,
  ...props
}: BadgeProps): React.JSX.Element {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
