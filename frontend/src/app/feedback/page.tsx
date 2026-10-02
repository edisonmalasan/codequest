import { FeedbackDraft } from '@/features/feedback/feedback-draft';

export default function FeedbackPage(): React.JSX.Element {
  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 px-5 py-10 text-ink sm:px-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl">Feedback draft</h1>
        <p className="text-muted">
          Write down what worked or felt difficult while it is fresh.
        </p>
      </header>
      <FeedbackDraft />
    </main>
  );
}
