import Image from 'next/image';
import Link from 'next/link';
import { HomeLearning } from '@/features/home/home-learning';
import styles from './homepage.module.css';

export default function Home(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>A new path through code</p>
          <h1 id="home-title">Your next world starts with one line.</h1>
          <p className={styles.lead}>
            Learn to build for the web through short lessons, hands-on code, and
            a path you can see.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/courses">
              Explore learning <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.secondaryAction} href="/onboarding">
              How it works <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className={styles.heroNote}>
            Start as a guest where supported. Guest work stays on this device
            until you choose to import it into an account.
          </p>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <Image
            src="/assets/design-system/worlds/foundations-valley.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 800px) 100vw, 54vw"
            className={styles.worldImage}
          />
          <span className={styles.artCaption}>01 / FOUNDATIONS VALLEY</span>
        </div>
      </section>

      <section
        id="learning"
        className={styles.learning}
        aria-labelledby="learning-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Choose a direction</p>
            <h2 id="learning-title">A route for every first step.</h2>
          </div>
          <p>
            These learning paths come from the published curriculum. Open one to
            see its real chapters and exercises.
          </p>
        </div>
        <HomeLearning />
      </section>

      <section className={styles.how} aria-labelledby="how-title">
        <div className={styles.howIntro}>
          <p className={styles.eyebrow}>The way forward</p>
          <h2 id="how-title">Read it. Write it. See what happens.</h2>
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
