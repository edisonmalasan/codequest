'use client';

import { cn } from '@/lib/cn';

export interface QuestPathProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

// Ordered quest trail. Node order and status come from props; the connector
// line is decorative and hidden from assistive technology.
export function QuestPath({
  label,
  children,
  className,
}: QuestPathProps): React.JSX.Element {
  return (
    <ol
      aria-label={label}
      className={cn('relative flex flex-col gap-4 pl-1', className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-5 w-0.5 bg-line"
      />
      {children}
    </ol>
  );
}
