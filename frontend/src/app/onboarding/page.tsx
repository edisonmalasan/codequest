import Link from 'next/link';
import styles from '../supporting-page.module.css';

export default function OnboardingPage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Your first steps</p>
        <h1>Start with a small win.</h1>
        <p>
          Practice JavaScript in short quests. Run and Check give immediate
          local feedback; accepted account progress is handled by the backend.
        </p>
      </header>
      <ol className={styles.steps}>
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
      <nav aria-label="Next steps" className={styles.actions}>
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
