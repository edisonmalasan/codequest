'use client';

import { cn } from '@/lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

// Placeholder matching the shape of pending content (pass width/height via
// className). Shimmer is CSS-only and collapses under reduced motion.
export function Skeleton({
  label = 'Loading content',
  className,
  ...props
}: SkeletonProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label={label}
      aria-hidden={false}
      className={cn(
        'animate-pulse rounded-md border border-line bg-surface-elevated motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
