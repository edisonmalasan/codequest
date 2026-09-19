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

// Menu-button dropdown: Enter/Space/ArrowDown opens, focus moves into the
// menu with roving tabindex so assistive technology announces the active
// item, arrows move, Enter selects, Escape closes and returns focus.
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
  const focusOnOpen = useRef<number | null>(null);
  const selected = options.find((option) => option.value === value);

  const optionId = (optionValue: string): string =>
    `${baseId}-option-${optionValue}`;

  const focusOption = (index: number): void => {
    const option = options[index];
    if (option) {
      document.getElementById(optionId(option.value))?.focus();
    }
  };

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

  const openMenu = (index: number, moveFocus: boolean): void => {
    setActiveIndex(index);
    focusOnOpen.current = moveFocus ? index : null;
    setOpen(true);
  };

  useEffect(() => {
    if (open && focusOnOpen.current !== null) {
      focusOption(focusOnOpen.current);
      focusOnOpen.current = null;
    }
  }, [open]);

  const moveActive = (delta: 1 | -1): void => {
    const next = (activeIndex + delta + options.length) % options.length;
    setActiveIndex(next);
    focusOption(next);
  };

  const selectActive = (): void => {
    const option = options[activeIndex];
    if (option) {
      onSelect?.(option.value);
      setOpen(false);
      document.getElementById(`${baseId}-trigger`)?.focus();
    }
  };

  // Focus rests on the trigger after mouse-open, so the trigger mirrors
  // the menu keyboard contract for that flow too.
  const onTriggerKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    } else if (
      !open &&
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault();
      openMenu(0, true);
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
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectActive();
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
        onClick={() => (open ? setOpen(false) : openMenu(0, false))}
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
              id={optionId(option.value)}
              type="button"
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
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
