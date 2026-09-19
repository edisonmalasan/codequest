'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';

export interface ChapterCardProps {
  title: string;
  description: string;
  completedQuests: number;
  totalQuests: number;
  statusText: string;
  onOpen?: () => void;
  className?: string;
}

// Display-only chapter summary composed from core components. Counts and
// status arrive as props; progress derivation belongs to later phases.
export function ChapterCard({
  title,
  description,
  completedQuests,
  totalQuests,
  statusText,
  onOpen,
  className,
}: ChapterCardProps): React.JSX.Element {
  return (
    <Card className={cn('pixel-frame w-full max-w-sm', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold tracking-wide text-ink uppercase">
          {title}
        </h2>
        <Badge variant="neutral">{statusText}</Badge>
      </div>
      <p className="mb-4 font-sans text-sm text-muted">{description}</p>
      <Progress
        value={completedQuests}
        max={totalQuests}
        label={`${title} quests`}
      />
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-4 inline-flex h-9 items-center rounded-sm border border-line px-4 font-sans text-sm font-semibold text-ink outline-none transition-colors duration-quick hover:border-ascent hover:text-ascent focus-visible:ring-2 focus-visible:ring-ascent"
        >
          Open chapter
        </button>
      )}
    </Card>
  );
}
