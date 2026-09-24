import { FileCode2 } from 'lucide-react';
import type { SaveStatus } from './editor-workspace-types';

const saveLabels: Record<SaveStatus, string> = {
  loading: 'Loading local draft…',
  ready: 'Starter source ready',
  unsaved: 'Unsaved local changes',
  saving: 'Saving locally…',
  saved: 'Saved on this device',
  failed: 'Local save failed — edits remain open',
};

export function EditorToolbar({
  fileName,
  language,
  saveStatus,
}: {
  fileName: string;
  language: string;
  saveStatus: SaveStatus;
}): React.JSX.Element {
  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-raised px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <FileCode2
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-discovery"
        />
        <div className="min-w-0">
          <h2 className="truncate font-sans text-sm font-bold text-ink">
            {fileName}
          </h2>
          <p className="font-mono text-xs text-muted">{language}</p>
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="text-xs font-semibold text-muted"
        data-save-status={saveStatus}
      >
        {saveLabels[saveStatus]}
      </p>
    </header>
  );
}
