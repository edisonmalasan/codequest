'use client';

import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  label: string;
  options: SelectOption[];
  helperText?: string;
  errorText?: string;
}

// Native select: full keyboard/screen-reader behavior built in, styled to the
// conventional control language.
export function Select({
  label,
  options,
  helperText,
  errorText,
  id: idProp,
  className,
  ...props
}: SelectProps): React.JSX.Element {
  const autoId = useId();
  const id = idProp ?? `select-${autoId}`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-sans text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'min-h-11 w-full appearance-none rounded-md border border-line-strong bg-surface-sunken pr-10 pl-3 text-base text-ink outline-none transition-colors duration-quick ease-ui hover:border-muted focus:border-discovery disabled:cursor-not-allowed disabled:opacity-45 aria-[invalid=true]:border-danger',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={2}
        />
      </div>
      {helperText && !errorText && (
        <p id={helperId} className="font-sans text-sm text-muted">
          {helperText}
        </p>
      )}
      {errorText && (
        <p id={errorId} role="alert" className="font-sans text-sm text-danger">
          {errorText}
        </p>
      )}
    </div>
  );
}
