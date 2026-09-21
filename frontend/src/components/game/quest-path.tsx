import { cn } from '@/lib/cn';

export interface QuestPathProps {
  label: string;
  children: React.ReactNode;
  artworkSrc?: string;
  description?: string;
  className?: string;
}

export function QuestPath({
  label,
  children,
  artworkSrc,
  description,
  className,
}: QuestPathProps): React.JSX.Element {
  return (
    <section
      aria-label={label}
      className={cn(
        'pixel-corners pixel-grid pixel-frame relative isolate w-full overflow-hidden p-5 sm:p-7',
        className,
      )}
    >
      {artworkSrc && (
        <img
          aria-hidden="true"
          alt=""
          src={artworkSrc}
          className="pixel-art absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-surface/55"
      />
      <header className="mb-8 max-w-xl">
        <span className="game-label text-xs text-ascent">Quest route</span>
        <h3 className="mt-1 font-display text-2xl font-bold text-ink">
          {label}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
      </header>
      <ol
        aria-label={label}
        className="relative grid gap-6 before:absolute before:top-5 before:bottom-5 before:left-6 before:-z-10 before:w-1 before:bg-ascent/50 md:grid-cols-4 md:gap-5 md:before:top-6 md:before:right-8 md:before:bottom-auto md:before:left-8 md:before:h-1 md:before:w-auto"
      >
        {children}
      </ol>
    </section>
  );
}
