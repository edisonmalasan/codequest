import Image from 'next/image';
import { cn } from '@/lib/cn';

export interface CodeQuestLogoProps {
  compact?: boolean;
  className?: string;
}

export function CodeQuestLogo({
  compact = false,
  className,
}: CodeQuestLogoProps): React.JSX.Element {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/assets/design-system/brand/codequest-mark.svg"
        alt=""
        width={48}
        height={48}
        className="pixel-art h-10 w-10 shrink-0 sm:h-12 sm:w-12"
        priority
      />
      {!compact && (
        <span className="flex flex-col">
          <span className="font-display text-2xl leading-none font-bold tracking-wide text-ink sm:text-3xl">
            CODE<span className="text-ascent">QUEST</span>
          </span>
          <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            Learn. Build. Debug.
          </span>
        </span>
      )}
    </span>
  );
}
