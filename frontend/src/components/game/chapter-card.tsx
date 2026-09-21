'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';

export interface ChapterCardProps {
  title: string;
  description: string;
  eyebrow?: string;
  artworkSrc?: string;
  artworkAlt?: string;
  completedQuests: number;
  totalQuests: number;
  statusText: string;
  onOpen?: () => void;
  className?: string;
}

export function ChapterCard({
  title,
  description,
  eyebrow = 'Chapter',
  artworkSrc,
  artworkAlt = '',
  completedQuests,
  totalQuests,
  statusText,
  onOpen,
  className,
}: ChapterCardProps): React.JSX.Element {
  return (
    <Card
      className={cn(
        'pixel-corners pixel-frame w-full max-w-md overflow-hidden p-0',
        className,
      )}
    >
      {artworkSrc && (
        <div className="relative h-36 overflow-hidden border-b-2 border-line-strong">
          <img
            src={artworkSrc}
            alt={artworkAlt}
            className="pixel-art h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-surface-raised to-transparent"
          />
        </div>
      )}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="game-label text-[10px] text-discovery">
              {eyebrow}
            </span>
            <h2 className="font-display text-xl font-bold tracking-wide text-ink">
              {title}
            </h2>
          </div>
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
            className="mt-5 inline-flex min-h-11 items-center rounded-sm border border-line-strong bg-surface-sunken px-4 font-sans text-sm font-semibold text-ink outline-none transition-colors duration-quick hover:border-ascent hover:text-ascent"
          >
            Open chapter
          </button>
        )}
      </div>
    </Card>
  );
}
