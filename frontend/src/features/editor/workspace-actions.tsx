import { Play, RotateCcw, Save, Square } from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/components/ui/button';

export function WorkspaceActions({
  onSave,
  onReset,
  onRun,
  onCancel,
  running = false,
  disabled = false,
}: {
  onSave: () => void;
  onReset: () => void;
  onRun?: () => void;
  onCancel?: () => void;
  running?: boolean;
  disabled?: boolean;
}): React.JSX.Element {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <h3 id={titleId} className="font-sans text-sm font-bold">
        Workspace actions
      </h3>
      <div className="flex flex-wrap gap-3">
        {onRun && !running && (
          <Button type="button" onClick={onRun} disabled={disabled}>
            <Play aria-hidden="true" className="h-4 w-4" /> Run
          </Button>
        )}
        {onCancel && running && (
          <Button type="button" variant="danger" onClick={onCancel}>
            <Square aria-hidden="true" className="h-4 w-4" /> Cancel
          </Button>
        )}
        <Button type="button" onClick={onSave} disabled={disabled}>
          <Save aria-hidden="true" className="h-4 w-4" /> Save locally
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onReset}
          disabled={disabled}
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" /> Reset file
        </Button>
      </div>
      <dl className="grid gap-1 text-xs text-muted">
        {onRun && (
          <div className="flex justify-between gap-4">
            <dt>Run</dt>
            <dd className="font-mono">Ctrl/⌘ + Enter</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>Save</dt>
          <dd className="font-mono">Ctrl/⌘ + S</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Reset file</dt>
          <dd className="font-mono">Ctrl/⌘ + Shift + Backspace</dd>
        </div>
      </dl>
    </section>
  );
}
