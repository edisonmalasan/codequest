import Image from 'next/image';
import Link from 'next/link';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import styles from './auth-frame.module.css';

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
    <main className={styles.page}>
      <div className={styles.frame}>
        <div className={styles.art} aria-hidden="true">
          <Image
            src="/assets/design-system/worlds/signal-road.webp"
            alt=""
            fill
            sizes="46vw"
            className={styles.artImage}
          />
        </div>
        <div className={styles.formSide}>
          <Link href="/" className={styles.home} aria-label="CodeQuest home">
            <CodeQuestLogo />
          </Link>
          <section className={styles.card}>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className={styles.formContent}>{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
