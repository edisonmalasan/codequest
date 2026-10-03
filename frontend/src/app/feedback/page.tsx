import { FeedbackDraft } from '@/features/feedback/feedback-draft';
import styles from '../supporting-page.module.css';

export default function FeedbackPage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Private notes</p>
        <h1>Feedback draft</h1>
        <p>Write down what worked or felt difficult while it is fresh.</p>
      </header>
      <div className={styles.panel}>
        <FeedbackDraft />
      </div>
    </main>
  );
}
