import Link from 'next/link';

export default function Home(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface px-5 py-12 text-center text-ink">
      <h1 className="font-display text-4xl font-bold">CodeQuest</h1>
      <p className="max-w-prose leading-7 text-muted">
        Practice JavaScript one quest at a time.
      </p>
      <nav
        aria-label="Start learning"
        className="flex flex-wrap justify-center gap-3"
      >
        <Link
          href="/journeys/javascript-foundations"
          className="inline-flex min-h-11 items-center rounded-md border border-ascent bg-ascent px-4 font-bold text-ascent-ink"
        >
          Explore JavaScript Foundations
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-4 font-bold text-ink"
        >
          Sign in
        </Link>
        <Link
          href="/onboarding"
          className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-4 font-bold text-ink"
        >
          How learning works
        </Link>
      </nav>
      <Link className="text-sm text-muted underline" href="/feedback">
        Draft feedback on this device
      </Link>
    </main>
  );
}
