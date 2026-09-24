const hints = [
  ['Question hint', 'question'],
  ['Concept hint', 'concept'],
  ['Next-step hint', 'nextStep'],
] as const;

export function LessonHints({
  value,
}: {
  readonly value: {
    readonly question: string;
    readonly concept: string;
    readonly nextStep: string;
  };
}): React.JSX.Element {
  return (
    <section
      aria-labelledby="lesson-hints-heading"
      className="rounded-lg border border-line bg-surface-raised p-5 sm:p-6"
    >
      <p className="game-label text-xs text-reward">Need a signal?</p>
      <h2
        id="lesson-hints-heading"
        className="mt-2 font-display text-2xl font-bold"
      >
        Graduated hints
      </h2>
      <p className="mt-3 leading-7 text-muted">
        Open one hint at a time. Hints do not change progress or rewards.
      </p>
      <div className="mt-5 space-y-3">
        {hints.map(([label, key], index) => (
          <details
            key={key}
            className="group rounded-md border border-line bg-surface-sunken open:border-reward"
          >
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-4 py-3 font-bold outline-none marker:content-none">
              <span>
                {index + 1}. {label}
              </span>
              <span
                aria-hidden="true"
                className="text-reward group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="border-t border-line px-4 py-4 leading-7 text-muted">
              {value[key]}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
