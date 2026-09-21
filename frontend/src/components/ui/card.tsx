'use client';

import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
}

// Grouping surface for related content. Title renders as a real heading so
// card meaning never depends on visual styling alone.
export function Card({
  title,
  className,
  children,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <section
      className={cn(
        'rounded-lg border border-line bg-surface-raised p-5 shadow-soft',
        className,
      )}
      {...props}
    >
      {title && (
        <h2 className="mb-2 font-sans text-lg font-bold text-ink">{title}</h2>
      )}
      {children}
    </section>
  );
}
