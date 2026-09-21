import { cn } from '@/lib/cn';

export interface LevelBadgeProps {
  level: number;
  title?: string;
  emblemSrc?: string;
  className?: string;
}

export function LevelBadge({
  level,
  title,
  emblemSrc,
  className,
}: LevelBadgeProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'pixel-corners pixel-frame-reward inline-flex min-h-16 items-center gap-3 px-4 py-2',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative grid h-11 w-11 place-items-center"
      >
        <span className="absolute inset-0 rotate-45 border-2 border-reward bg-surface-sunken" />
        <span className="relative font-display text-xl font-bold text-reward">
          {level}
        </span>
      </span>
      <span className="sr-only">
        Level {level}
        {title ? ` — ${title}` : ''}
      </span>
      {emblemSrc && (
        <img
          aria-hidden="true"
          alt=""
          src={emblemSrc}
          className="pixel-art h-8 w-8"
        />
      )}
      <span className="flex flex-col">
        <span className="game-label text-[10px] text-reward">Level</span>
        <span className="font-display text-base font-semibold text-ink">
          {title ?? `Explorer ${level}`}
        </span>
      </span>
    </div>
  );
}
