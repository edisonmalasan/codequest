import Link from 'next/link';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';

export function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-12">
      <div
        aria-hidden="true"
        className="pixel-grid absolute inset-0 opacity-20"
      />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex text-ink transition-colors hover:text-ascent"
          aria-label="CodeQuest home"
        >
          <CodeQuestLogo />
        </Link>
        <section className="rounded-lg border border-line-strong bg-surface-raised p-6 shadow-hard sm:p-8">
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-ascent">
            Player access
          </p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-7">{children}</div>
        </section>
      </div>
    </main>
  );
}
