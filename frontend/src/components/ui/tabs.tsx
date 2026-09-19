'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  label: string;
  className?: string;
}

// Tablist with roving tabindex: arrows move between tabs, panels swap.
export function Tabs({
  tabs,
  defaultTabId,
  label,
  className,
}: TabsProps): React.JSX.Element {
  const baseId = useId();
  const [activeId, setActiveId] = useState<string>(
    defaultTabId ?? tabs[0]?.id ?? '',
  );

  const onTabKeyDown = (event: React.KeyboardEvent, index: number): void => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') {
      next = (index + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else {
      next = tabs.length - 1;
    }
    const nextTab = tabs[next];
    if (nextTab === undefined) {
      return;
    }
    setActiveId(nextTab.id);
    document.getElementById(`${baseId}-tab-${nextTab.id}`)?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 border-b border-line"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                'border-b-2 px-3 py-2 font-sans text-sm font-semibold outline-none transition-colors duration-quick',
                selected
                  ? 'border-ascent text-ink'
                  : 'border-transparent text-muted hover:text-ink focus-visible:text-ink',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) =>
        tab.id === activeId ? (
          <div
            key={tab.id}
            id={`${baseId}-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            tabIndex={0}
            className="font-sans text-base text-ink outline-none"
          >
            {tab.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
