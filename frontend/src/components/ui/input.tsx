'use client';

import { useId } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const inputStyles = cva(
  'h-10 w-full rounded-sm border bg-surface-sunken px-3 text-base text-ink placeholder:text-muted/70 outline-none transition-colors duration-quick ease-ui focus:border-ascent focus:ring-2 focus:ring-ascent/40 disabled:cursor-not-allowed disabled:opacity-45 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:border-danger aria-[invalid=true]:focus:ring-danger/40',
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  errorText?: string;
}

// Label sits above the input; helper is optional; error renders below and is
// announced via aria-describedby + aria-invalid. Never placeholder-as-label.
export function Input({
  label,
  helperText,
  errorText,
  id: idProp,
  className,
  ...props
}: InputProps): React.JSX.Element {
  const autoId = useId();
  const id = idProp ?? `input-${autoId}`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-sans text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        className={cn(inputStyles(), className)}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
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
