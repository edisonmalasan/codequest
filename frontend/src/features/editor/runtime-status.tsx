import type { RuntimeDisplayState } from './editor-workspace-types';

export function RuntimeStatus({
  state = { kind: 'unavailable', label: 'Runtime unavailable' },
}: {
  state?: RuntimeDisplayState;
}): React.JSX.Element {
  return (
    <section
      aria-labelledby="workspace-runtime-title"
      className="rounded-md border border-line bg-surface-raised p-4"
    >
      <h3 id="workspace-runtime-title" className="font-sans text-sm font-bold">
        Runtime status
      </h3>
      <p
        role="status"
        className="mt-3 text-sm text-muted"
        data-runtime={state.kind}
      >
        {state.label}
      </p>
    </section>
  );
}
