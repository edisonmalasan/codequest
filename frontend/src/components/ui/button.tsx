'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md border font-sans font-bold transition-[transform,background-color,border-color,color] duration-quick ease-ui outline-none select-none disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px',
  {
    variants: {
      variant: {
        primary:
          'border-ascent bg-ascent text-ascent-ink shadow-hard-sm hover:-translate-y-0.5 hover:bg-ascent-strong',
        secondary:
          'border-line-strong bg-surface-raised text-ink hover:border-discovery hover:bg-surface-elevated',
        ghost:
          'border-transparent text-muted hover:border-line hover:bg-surface-raised hover:text-ink',
        danger:
          'border-danger bg-danger text-danger-ink hover:-translate-y-0.5 hover:brightness-105',
      },
      size: {
        sm: 'min-h-9 px-3 text-sm',
        md: 'min-h-11 px-4 text-base',
        lg: 'min-h-12 px-6 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span aria-live="polite">Loading…</span> : children}
    </button>
  );
}
