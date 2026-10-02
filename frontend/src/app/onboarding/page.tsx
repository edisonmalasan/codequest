import Link from 'next/link';

export default function OnboardingPage(): React.JSX.Element {
  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 px-5 py-10 text-ink sm:px-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl">Start your learning journey</h1>
        <p className="leading-7 text-muted">
          Practice JavaScript in short quests. Run and Check give immediate
          local feedback; accepted account progress is handled by the backend.
        </p>
      </header>
      <ol className="list-inside list-decimal space-y-5 leading-7">
        <li>
          Explore JavaScript Foundations and try guest quests Q01–Q04. Guest
          work is provisional and stays on this device.
        </li>
        <li>
          Create an account when you want accepted progress across devices.
          Signing up does not automatically import guest work.
        </li>
        <li>
          Open your account and explicitly import eligible guest work. The
          backend checks the current curriculum version and prerequisites;
          rejected work remains on this device for recovery.
        </li>
      </ol>
      <nav aria-label="Next steps" className="flex flex-wrap gap-4">
        <Link
          className="font-bold text-ascent underline"
          href="/journeys/javascript-foundations"
        >
          Explore the journey
        </Link>
        <Link className="font-bold text-ascent underline" href="/register">
          Create an account
        </Link>
        <Link className="font-bold text-ascent underline" href="/account">
          Review guest import
        </Link>
      </nav>
    </main>
  );
}
