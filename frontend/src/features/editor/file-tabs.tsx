'use client';

import { useId } from 'react';
import type { WorkspaceFile } from './editor-workspace-types';

export function FileTabs({
  files,
  activeFileId,
  onSelect,
  panelId,
}: {
  files: readonly WorkspaceFile[];
  activeFileId: string;
  onSelect: (fileId: string) => void;
  panelId: string;
}): React.JSX.Element {
  const baseId = useId();
  const move = (event: React.KeyboardEvent, index: number): void => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % files.length;
    if (event.key === 'ArrowLeft')
      next = (index - 1 + files.length) % files.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = files.length - 1;
    const file = files[next];
    if (file === undefined) return;
    onSelect(file.id);
    document.getElementById(`${baseId}-${file.id}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Workspace files"
      className="flex min-w-0 overflow-x-auto border-b border-line bg-surface"
    >
      {files.map((file, index) => {
        const active = file.id === activeFileId;
        return (
          <button
            key={file.id}
            id={`${baseId}-${file.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(file.id)}
            onKeyDown={(event) => move(event, index)}
            className={`min-h-11 shrink-0 border-r border-line px-4 font-mono text-sm font-semibold outline-none ${
              active
                ? 'border-b-2 border-b-ascent bg-surface-sunken text-ink'
                : 'text-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            {file.name}
          </button>
        );
      })}
    </div>
  );
}
