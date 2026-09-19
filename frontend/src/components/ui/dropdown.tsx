'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value?: string;
  onSelect?: (value: string) => void;
}

// Menu-button dropdown: Enter/Space/ArrowDown opens, arrows move, Enter
// selects, Escape closes and returns focus to the trigger.
export function Dropdown({
  label,
  options,
  value,
  onSelect,
}: DropdownProps): React.JSX.Element {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return (): void => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const openMenu = (index: number): void => {
    setActiveIndex(index);
    setOpen(true);
  };

  const selectActive = (): void => {
    const option = options[activeIndex];
    if (option) {
      onSelect?.(option.value);
      setOpen(false);
    }
  };

  // Focus stays on the trigger while the menu is open, so the trigger owns
  // the full open-state keyboard contract: arrows move, Enter selects,
  // Escape closes. The menu container mirrors it for focus-inside cases.
  const onTriggerKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    } else if (
      !open &&
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault();
      openMenu(0);
    } else if (open && event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (open && event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + options.length) % options.length);
    } else if (open && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      selectActive();
    }
  };

  const onMenuKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      document.getElementById(`${baseId}-trigger`)?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) {
        onSelect?.(option.value);
        setOpen(false);
      }
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative inline-flex flex-col gap-2">
      <button
        id={`${baseId}-trigger`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${baseId}-menu`}
        onClick={() => (open ? setOpen(false) : openMenu(0))}
        onKeyDown={onTriggerKeyDown}
        className="inline-flex h-10 items-center justify-between gap-2 rounded-sm border border-line bg-surface-raised px-4 font-sans text-sm font-semibold text-ink outline-none transition-colors duration-quick hover:border-muted focus-visible:ring-2 focus-visible:ring-ascent"
      >
        {selected ? selected.label : label}
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-muted"
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          id={`${baseId}-menu`}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className="absolute top-full left-0 z-30 mt-1 min-w-44 rounded-sm border border-line bg-surface-raised p-1 shadow-soft"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-current={option.value === value || undefined}
              onClick={() => {
                onSelect?.(option.value);
                setOpen(false);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={
                'flex w-full items-center rounded-sm px-3 py-2 font-sans text-sm outline-none transition-colors ' +
                (index === activeIndex
                  ? 'bg-surface-sunken text-ink'
                  : 'text-muted')
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
