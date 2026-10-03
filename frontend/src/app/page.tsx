import Image from 'next/image';
import Link from 'next/link';
import { HomeLearning } from '@/features/home/home-learning';
import styles from './homepage.module.css';

export default function Home(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroArt} aria-hidden="true">
          <Image
            src="/assets/design-system/worlds/signal-road.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 800px) 100vw, 100vw"
            className={styles.worldImage}
          />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Learn by building</p>
          <h1 id="home-title">Make code work.</h1>
          <p className={styles.lead}>
            Read a little. Try it yourself. See what changed, then take the next
            step.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/courses">
              Explore courses <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.secondaryAction} href="/onboarding">
              How it works <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <p className={styles.heroNote}>
        Guest lessons are available where supported. Guest work stays on this
        device until you choose to import it into an account.
      </p>

      <section
        id="learning"
        className={styles.learning}
        aria-labelledby="learning-title"
      >
        <div className={styles.sectionHeading}>
          <h2 id="learning-title">Choose a route. Start making.</h2>
          <p>Open a published path to see its chapters and exercises.</p>
        </div>
        <HomeLearning />
      </section>

      <section className={styles.how} aria-labelledby="how-title">
        <div className={styles.howIntro}>
          <h2 id="how-title">Learn it, test it, make it yours.</h2>
          <p>
            Each exercise gives you a place to try code, inspect the result, and
            use feedback to find your next move.
          </p>
          <Link href="/onboarding" className={styles.textAction}>
            Learn how progress works <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ol className={styles.steps}>
          <li>
            <span>01 / EXPLORE</span>
            <strong>Follow a published path.</strong>
            <p>Open a Journey and work through its available exercises.</p>
          </li>
          <li>
            <span>02 / EXPERIMENT</span>
            <strong>Run and Check your code.</strong>
            <p>Get immediate local output and Check feedback in the browser.</p>
          </li>
          <li>
            <span>03 / KEEP GOING</span>
            <strong>Save accepted account progress.</strong>
            <p>
              After sign in, the backend checks submissions before account
              progress is accepted. A local Check alone does not save it.
            </p>
          </li>
        </ol>
      </section>

      <section
        className={styles.accountCallout}
        aria-labelledby="account-title"
      >
        <div>
          <p className={styles.eyebrow}>Keep your place</p>
          <h2 id="account-title">Ready to carry your progress forward?</h2>
          <p>
            Create an account for backend-accepted progress. If you have guest
            work on this device, importing it is a separate, explicit step.
          </p>
        </div>
        <div className={styles.accountActions}>
          <Link href="/register" className={styles.primaryAction}>
            Create an account <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/account" className={styles.textAction}>
            Open account <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
